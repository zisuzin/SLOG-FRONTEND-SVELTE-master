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

    // 페이지 증가시 호출
    const fetchArticles = async () => {
        // 스토어 값을 get으로 받아와야 하는 경우:
        // 다른 스토어에서 값 참조, 일반 js 파일에서 값 참조
        const curretPage = get(currentArticlesPage);
        let path = `/articles/?pageNumber=${curretPage}`;

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
                if (curretPage === 1) {
                    datas.articleList = newData.articleList;
                    datas.totalPageCount = newData.totalPageCount;
                } else {
                    const newArticles = [...datas.articleList, ...newData.articleList];
                    datas.articleList = newArticles;
                    datas.totalPageCount = newData.totalPageCount;
                }
                return datas;
            });
        } catch (error) {
            loadingArticle.turnOffLoading();
            throw error;
        }
    };

    // articles 스토어 초기화
    const resetArticles = () => {
        set({ ...initValues });
        currentArticlesPage.resetPage();
    };

    return {
        subscribe,
        fetchArticles,
        resetArticles,
    };
}

// 로딩상태 표시 스토어
function setLoadingArticle() {}

// 게시물 하나의 정보를 담는 스토어
function setArticleContent() {}

// 댓글 추가, 수정, 삭제 처리 스토어
function setComments() {}

// 로그인된 유저 정보 스토어
function setAuth() {
    let initValues = {
        id: "",
        email: "",
        Authorization: "",
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
            router.goto("/");
            console.log("회원가입 성공!");
        } catch (error) {
            // alert('오류가 발생했습니다. 로그인을 다시 시도해 주세요.');
            throw error;
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
export const loadingArticle = setLoadingArticle();
export const articleContent = setArticleContent();
export const comments = setComments();
export const auth = setAuth();
export const articlesMode = setArticlesMode();
export const isLogin = setIsLogin();
export const isRefresh = writable(false);
