import { writable, get } from "svelte/store";
import { getApi, putApi, delApi, postApi } from "../service/api.js";
import { router } from "tinro";

// 게시물 스크롤시 페이지 증가 스토어
function setCurrentArticlesPage() {}

// 좋아요, 댓글 추가시 상태 변경 스토어 
function setArticles() {}

// 로딩상태 표시 스토어
function setLoadingArticle() {}

// 게시물 하나의 정보를 담는 스토어
function setArticleContent() {}

// 댓글 추가, 수정, 삭제 처리 스토어
function setComments() {}

// 로그인된 유저 정보 스토어
function setAuth() {
    let initValues = {
        id: '',
        email: '',
        Authorization: '',
    }

    const { subscribe, set, update } = writable({...initValues});

    // 서버로 access_token 재요청
    const refresh = async () => {
        try {
            const authenticationUser = await postApi({path: '/auth/refresh'});
            set(authenticationUser);
            isRefresh.set(true);
        }
        catch (err) {
            auth.resetUserInfo();
            isRefresh.set(false);
        }
    };

    // auth 스토어 초기화
    const resetUserInfo = () => set({...initValues});
    const login = async (email, password) => {
        try {
            const options = {
                path: '/login',
                data: {
                    email: email,
                    pwd: password,
                }
            }

            const result = await postApi(options);
            set(result);
            isRefresh.set(true);
            // 첫 화면 이동
            router.goto('/');
        }
        catch (error) {
            alert('오류가 발생했습니다. 로그인을 다시 시도해 주세요.');
        }
    };
    const logout = async () => {
        try {
            const options = {
                path: '/auth/logout',
            }

            await delApi(options);
            set({...initValues});
            isRefresh.set(false);
            router.goto('/');
        }
        catch (error) {
            alert('오류가 발생했습니다. 다시 시도해 주세요.');
        }
    };
    const register = async (email, pwd) => {
        try {
            const options = {
                path: '/auth/register',
                data: {
                    email: email,
                    pwd: pwd,
                }
            }

            await postApi(options);
            alert('가입이 완료되었습니다.');
            router.goto('/login');
        }
        catch (error) {
            alert('오류가 발생했습니다. 다시 시도해 주세요.')
        }
    };

    return {
        subscribe,
        refresh,
        login,
        logout,
        resetUserInfo,
        register,
    }
}

// 모두보기, 좋아요보기, 내글보기 등 보기 상태 스토어
function setArticlesMode() {}

// 로그인 상태 확인 스토어
function setIsLogin() {}

export const currentArticlesPage = setCurrentArticlesPage();
export const aritles = setArticles();
export const loadingArticle = setLoadingArticle();
export const articleContent = setArticleContent();
export const comments = setComments();
export const auth = setAuth();
export const articlesMode = setArticlesMode();
export const isLogin = setIsLogin();
export const isRefresh = writable(false);