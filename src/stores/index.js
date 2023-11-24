import { writable, get, derived } from "svelte/store";
import { getApi, putApi, delApi, postApi } from "../service/api.js";
import { router } from "tinro";

// 게시물 스크롤시 페이지 증가 스토어
function setCurrentArticlesPage() {
    const { subscribe, update, set } = writable(1);

    const resetPage = () => set(1);
    const increPage = () => {
        update((data) => (data = data + 1));
        articles.fetchArticles();
    };

    return {
        subscribe,
        resetPage,
        increPage,
    };
}

// 좋아요, 댓글 추가시 상태 변경 스토어
function setArticles() {
    let initValues = {
        articleList: [],
        totalPageCount: 0,
        menuPopup: "",
        editMode: "",
    };

    const { subscribe, update, set } = writable({ ...initValues });

    // 아티클 목록 불러오기
    const fetchArticles = async () => {
        loadingArticle.turnOnLoading();

        // 스토어 값을 get으로 받아와야 하는 경우:
        // 다른 스토어에서 값 참조, 일반 js 파일에서 값 참조
        const currentPage = get(currentArticlesPage);
        console.log(currentPage);
        let path = `/articles/?pageNumber=${currentPage}`;

        try {
            const access_token = get(auth).Authorization;

            const options = {
                path: path,
                access_token: access_token,
            };

            const getDatas = await getApi(options);

            const newData = {
                articleList: getDatas.articleList,
                totalPageCount: getDatas.totalPageCount,
            };

            update((datas) => {
                if (currentPage === 1) {
                    datas.articleList = newData.articleList;
                    datas.totalPageCount = newData.totalPageCount;
                } else {
                    const newArticles = [...datas.articleList, ...newData.articleList];
                    datas.articleList = newArticles;
                    datas.totalPageCount = newData.totalPageCount;
                }

                return datas;
            });

            loadingArticle.turnOffLoading();
        } catch (error) {
            loadingArticle.turnOffLoading();
            throw error;
        }
    };

    // 팝업 열기
    const openMenuPopup = (id) => {
        update((datas) => {
            datas.menuPopup = id;
            return datas;
        });
    };

    // 팝업 닫기
    const closeMenuPopup = () => {
        update((datas) => {
            datas.menuPopup = "";
            return datas;
        });
    };

    const openEditModeArticle = (id) => {
        articles.closeMenuPopup();

        update((datas) => {
            datas.editMode = id;
            return datas;
        });
    };

    const closeEditModeArticle = () => {
        update((datas) => {
            datas.editMode = "";
            return datas;
        });
    };

    // 수정된 글 업데이트 
    const updateArticle = async (article) => {
        const access_token = get(auth).Authorization;

        try {
            const updateData = {
                articleId: article.id,
                content: article.content,
            }

            const options = {
                path: '/article',
                data: updateData,
                access_token: access_token,
            }

            const updateArticle = await putApi(options);

            update(datas => {
                const newArticleList = datas.articleList.map(article => {
                    if (article.id === updateArticle.id) {
                        article = updateArticle;
                    }
                    return article;
                })
                datas.articleList = newArticleList;
                return datas;
            })

            articles.closeEditModeArticle();
            alert('수정이 완료되었습니다.');
        }
        catch (error) {
            alert('수정 중에 오류가 발생했습니다. 다시 시도해 주세요.');
        }
    }

    // 글 삭제
    const deleteArticle = async (id) => {
        const access_token = get(auth).Authorization;

        try {
            const options = {
                path: `/articles/${id}`,
                access_token: access_token
            }

            await delApi(options);

            update(dates => {
                const newArticleList = dates.articleList.filter(article => article.id !== id);
                dates.articleList = newArticleList;
                return dates;
            })
        }
        catch (error) {
            alert('삭제 중 오류가 발생했습니다.')
        }
    }

    // articles 스토어 초기화
    const resetArticles = () => {
        set({ ...initValues });
        currentArticlesPage.resetPage();
        // 페이지 잠금 해제
        articlePageLock.set(false);
    };

    const addArticle = async (content) => {
        const access_token = get(auth).Authorization;

        try {
            const options = {
                path: "/articles",
                data: {
                    content: content,
                },
                access_token: access_token,
            };

            const newArticle = await postApi(options);

            update((datas) => {
                datas.articleList = [newArticle, ...datas.articleList];
                return datas;
            });

            return;
        } catch (error) {
            throw error;
        }
    };

    return {
        subscribe,
        fetchArticles,
        resetArticles,
        addArticle,
        openMenuPopup,
        closeMenuPopup,
        openEditModeArticle,
        closeEditModeArticle,
        updateArticle,
        deleteArticle,
    };
}

// 로딩상태 표시 스토어
function setLoadingArticle() {
    const { subscribe, set } = writable(false);

    // 서버로부터 데이터 로딩중 상태
    const turnOnLoading = () => {
        set(true);
        // 페이지값 증가 막기
        articlePageLock.set(true);
    };

    // 로딩 완료된 상태
    const turnOffLoading = () => {
        set(false);
        articlePageLock.set(false);
    };

    return {
        subscribe,
        turnOnLoading,
        turnOffLoading,
    };
}

// 게시물 하나의 정보를 담는 스토어
function setArticleContent() {}

// 댓글 추가, 수정, 삭제 처리 스토어
function setComments() {}

// 로그인된 유저 정보 스토어
function setAuth() {
    let initValues = {
        id: "",
        email: "",
        Authorization: "", // access_token
    };

    const { subscribe, set, update } = writable({ ...initValues });

    // 서버로 access_token 재요청
    const refresh = async () => {
        try {
            const authenticationUser = await postApi({ path: "/auth/refresh" });
            set(authenticationUser);
            isRefresh.set(true);
        } catch (err) {
            auth.resetUserInfo();
            isRefresh.set(false);
        }
    };

    // auth 스토어 초기화
    const resetUserInfo = () => set({ ...initValues });

    const login = async (email, password) => {
        try {
            const options = {
                path: "/auth/login",
                data: {
                    email: email,
                    pwd: password,
                },
            };

            const result = await postApi(options);
            set(result);
            isRefresh.set(true);
            // 첫 화면 이동
            router.goto("/articles");
        } catch (error) {
            alert("오류가 발생했습니다. 로그인을 다시 시도해 주세요.");
        }
    };
    const logout = async () => {
        try {
            const options = {
                path: "/auth/logout",
            };

            await delApi(options);
            set({ ...initValues });
            isRefresh.set(false);
            router.goto("/");
        } catch (error) {
            alert("오류가 발생했습니다. 다시 시도해 주세요.");
        }
    };
    const register = async (email, pwd) => {
        try {
            const options = {
                path: "/auth/register",
                data: {
                    email: email,
                    pwd: pwd,
                },
            };

            await postApi(options);
            alert("가입이 완료되었습니다.");
            router.goto("/login");
        } catch (error) {
            alert("오류가 발생했습니다. 다시 시도해 주세요.");
        }
    };

    return {
        subscribe,
        refresh,
        login,
        logout,
        resetUserInfo,
        register,
    };
}

// 모두보기, 좋아요보기, 내글보기 등 보기 상태 스토어
function setArticlesMode() {}

// 로그인 상태 확인 스토어
function setIsLogin() {
    const checkLogin = derived(auth, ($auth) => ($auth.Authorization ? true : false));
    return checkLogin;
}

export const currentArticlesPage = setCurrentArticlesPage();
export const articles = setArticles();
export const articlePageLock = writable(false);
export const loadingArticle = setLoadingArticle();
export const articleContent = setArticleContent();
export const comments = setComments();
export const auth = setAuth();
export const articlesMode = setArticlesMode();
export const isLogin = setIsLogin();
export const isRefresh = writable(false);
