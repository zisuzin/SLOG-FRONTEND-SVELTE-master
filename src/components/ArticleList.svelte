<script>
    import { onMount } from "svelte";
    import { articles, currentArticlesPage, loadingArticle, articlePageLock, articlesMode } from "../stores";
    import Article from "./Article.svelte";
    import ArticleLoading from "./ArticleLoading.svelte";
    import { router } from "tinro";

    let component;
    let element;
    let currentMode = $router.path.split("/")[2];

    onMount(() => {
        articlesMode.changeMode(currentMode);
    })

    $: {
        if (component) {
           element = component.parentNode;
           element.addEventListener('scroll', onScroll);
           element.addEventListener('resize', onScroll);
        }
    }

    const onScroll = (e) => {
        console.log("스크롤 !")
        const scrollHeight = e.target.scrollHeight;
        const clientHeight = e.target.clientHeight;
        const scrollTop = e.target.scrollTop;
        const realHeight = scrollHeight - clientHeight;
        const triggerHeight = realHeight * 0.7;

        const triggerComputed = () => {
            return scrollTop > triggerHeight;
        }

        // 현재 페이지가 전체페이지보다 작거나 같으면 true 리턴
        const countCheck = () => {
            const check = $articles.totalPageCount <= $currentArticlesPage
            return check;
        }

        if (countCheck()) {
            articlePageLock.set(true);
        }

        const scrollTrigger = () => {
            return triggerComputed() && !countCheck() && !$articlePageLock;
        }

        if (scrollTrigger()) {
            currentArticlesPage.increPage();
        }
    }
</script>

<!-- slog-list-wrap start-->
<div class="slog-list-wrap" bind:this={component}>    
    <ul class="slog-ul">
        {#each $articles.articleList as article, index}
        <li class="mb-5">
            <Article {article}/>
        </li>
        {/each}
    </ul>

    {#if $loadingArticle}
        <ArticleLoading/>
    {/if}
</div>
<!-- slog-list-wrap end-->