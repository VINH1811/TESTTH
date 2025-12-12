const DNN = {
    en: {
        hello: "hello"
    },
    vi: {
        hello: "xin chao"
    }
}
const chonNN = document.getElementById('daNgonNgu')
function apDungNN(lang){
    document.querySelectorAll('[data-i18n]').forEach(e=>{
        const key = e.getAttribute('data-i18n')
        e.textContent = DNN[lang][key] || key
    })
}
apDungNN('en')
document.addEventListener("change", e=>{
    apDungNN(e.target.value)
})