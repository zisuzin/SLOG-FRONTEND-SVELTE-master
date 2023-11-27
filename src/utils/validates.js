import * as yup from 'yup';

// 폼 별로 발생하는 오류 수집
export const extractErrors = error => {
    return error.inner.reduce((acc, error) => {
        return {...acc, [error, path]: error.message}
    }, {})
}

// 게시글 작성 검증
export const contentValidate = yup.object().shape({
    formContent: yup.string().required('내용을 입력해 주세요.').label('내용'),
})

// 로그인 폼 검증
export const logValidate = yup.object().shape({
    formEmail: yup.string().required('이메일을 입력해주세요.').email('이메일 형식이 잘못되었습니다.').label('이메일'),
    formPassword: yup.string().required('패스워드를 입력해주세요.').label('패스워드'),
})

// 회원가입 폼 검증
export const registerValidate = yup.object().shape({
    formEmail: yup.string().required('이메일을 입력해주세요.').email('이메일 형식이 다릅니다.'),
    formPassword: yup.string().required('패스워드를 입력해주세요.'),
    formPasswordConfirm: yup.string().required('패스워드 확인을 입력해주세요.').oneOf([yup.ref('formPassword'), null], '패스워드와 패스워드 확인이 일치하지 않습니다.').label('패스워드 확인'),
})