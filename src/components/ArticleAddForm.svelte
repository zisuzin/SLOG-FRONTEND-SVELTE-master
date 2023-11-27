<script>
    import { articles } from "../stores";
    import { contentValidate, extractErrors } from "../utils/validates";

    let errors = {};

    let values = {
        formContent: '',
    };

    // 게시글 추가 메서드
    const onAddArticle = async () => {
        try {
            await contentValidate.validate(values, {abortEarly: false});
            await articles.addArticle(values.formContent);
            onCancelAddArticle();
        }
        catch (error) {
            errors = extractErrors(error);
            if (errors.formContent) alert(errors.formContent);
        }
    };

    // formContent 초기화 메서드
    const onCancelAddArticle = () => {
        values.formContent = '';
    };
</script>

<!-- slog-addForm start -->
<div class="slog-add-content-box">
    <div class="content-box-header">
      <div class="flex" >
        <p>새 게시물 작성</p>
      </div>
    </div>
    <div class="content-box-main">
      <textarea id="message" rows="5" class="slog-content-textarea" placeholder="내용을 입력해 주세요." bind:value="{values.formContent}"></textarea>
    </div>
    <div class="content-box-bottom">
      <div class="button-box">
        <button type="button" class="button-base" on:click="{onAddArticle}">입력</button>
        <button type="button" class="button-base" on:click="{onCancelAddArticle}">취소</button>
      </div>
    </div>
</div>
<!-- slog-addForm end -->