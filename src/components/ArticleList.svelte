<script>
    import { onMount } from "svelte";
    import { articles, currentArticlesPage } from "../stores";
    import Article from "./Article.svelte";

    let component;
    let element;

    onMount(() => {
      articles.resetArticles();  
      articles.fetchArticles();  
    })

    $: {
        if (component) {
           element = component.parentNode;
           element.addEventListener('scroll', onScroll);
           element.addEventListener('resize', onScroll);
        }
    }

    const onScroll = (e) => {
        const scrollHeigth = e.target.scrollHeigth;
        const clientHeight = e.target.clientHeight;
        const scrollTop = e.target.scrollTop;
        const realHeight = scrollHeigth - clientHeight;
        const triggerHeight = realHeight * 0.7;

        const triggerComputed = () => {
            return scrollTop > triggerHeight;
        }

        const scrollTrigger = () => {
            return triggerComputed();
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
</div>
<!-- slog-list-wrap end-->