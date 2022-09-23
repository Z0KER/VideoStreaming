document.getElementById('copy').addEventListener('click', clipboardCopy);
async function clipboardCopy() {
    let text = window.location.href;
    this.textContent = 'Copiado!';
    setInterval(() => {
        this.textContent = 'Copiar URL da sala';
    }, 3000)
    await navigator.clipboard.writeText(text);
}