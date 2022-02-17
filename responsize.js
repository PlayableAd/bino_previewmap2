
window.addEventListener('resize', (e) => {
    window.rHeight = e.target.innerHeight;
    console.log("🚀 ~ file: responsize.js ~ line 4 ~ window.addEventListener ~ rHeight", window.rHeight)
    window.rWidth = e.target.innerWidth;
    console.log("🚀 ~ file: responsize.js ~ line 6 ~ window.addEventListener ~ rWidth", window.rWidth)
})