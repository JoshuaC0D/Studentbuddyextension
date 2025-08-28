document.getElementById("summarize").addEventListener("click",()=>{
    const resultDiv=document.getElementById("result");//put it into div result
    const summaryType=document.getElementById("summary-type").value;

    resultDiv.innerHTML='<div class="loader"></div>'; //To show its loading

    //Step 1: Get the User's API key

    chrome.storage.sync.get(["geminiApiKey"],({geminiApiKey})=>{
        if(!geminiApiKey){
            resultDiv.textContent="No API key set. Click the gear icon to add one.";
            return;
        }
    

    //Step 2: Ask content.js for page text
    chrome.tabs.query({active:true, currentWindow:true},([tab])=>{  //To find the active tab,The current tab
        chrome.tabs.sendMessage(
            tab.id,
            {type:"GET_ARTICLE_TEXT"},
           async ({text})=>{
            if(!text){
                resultDiv.textContent="Couldn't extract text from this page.";
                return;
            }
            try{
                const summary=await getGeminiSummary(
                    text,
                    summaryType,
                    geminiApiKey
                );

                resultDiv.textContent= summary;
            } catch (error)  {
                resultDiv.textContent="Gemini error:"+ error.message;          
        }
    }
    );
    });
});
     //step 3:Send text to gemini
});
async function getGeminiSummary(rawText, type, apiKey){
    const max =20000;
    const text= rawText.length > max ? rawText.slice(0,max) +"...": rawText;

    const promptMap={
       brief: `Summarize in 3-4 sentences()(MAKE IT LOOK HUMAN):\n\n${text}`,

        detailed: `Give a detailed summary(100 to 300 words(MAKE IT LOOK HUMAN WRITTEN)): \n\n${text}`,
        bullet:`Summarize in 5-7 bullet points (start each line with"-"(MAKE IT LOOK HUMAN WRITTEN)):\n\n${text}`,
    };
const prompt =promptMap[type];

const res= await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            contents:[{parts:[{text:prompt}]}],
            generationConfig:{temperature:0.2},
        }),

    }
);
if(!res.ok){
    const {error}=await res.json();
    throw new Error(error?.message ||"Request failed");
}
const data=await res.json();
return data.candidates?.[0]?.content?.parts?.[0]?.text??"No summary.";
}

document.getElementById("copy-btn").addEventListener("click",()=>{
    const txt=document.getElementById("result").innerText;
    if(!txt) return;

    navigator.clipboard.writeText(txt).then(()=>{
        const btn=document.getElementById("copy-btn");
        const old=btn.textContent;
        btn.textContent ="Copied !";
        setTimeout(()=>(btn.textContent=old),2000)
    });
});