function getArticleText(){
    const article= document.querySelector("article");// to take the article
    if(article) return article.innerText; //to get the inner text of the article

    const paragraphs=Array.from(document.querySelectorAll("p"));//to take the everyparagraph from articla
    return paragraphs.map((p)=>p.innerText).join("\n");
}
chrome.runtime.onMessage.addListener((req, _sender, sendResponse)=>{
    if((req.type='GET_ARTICLE_TEXT')){
        const text=getArticleText();
        sendResponse({text});
    }
});
