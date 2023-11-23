<script>
    import { onMount } from "svelte";
    import { auth, isRefresh } from "./stores";
    import Router from "./router.svelte";

    const refresh_time = 1000 * 60 * 14;
    onMount(() => {
        const onRefresh = setInterval(() => {
            // 로그인된 경우
            if ($isRefresh) {
                auth.refresh();
            }
            // refresh 토큰이 만료 or 로그아웃 상태인 경우
            else {
                clearInterval(onRefresh)
            }
        }, refresh_time)
    })
</script>

<div class="main-container">
    <Router/>
</div>