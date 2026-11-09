const wrapper = document.getElementById('wrapper');
const searchInput = document.getElementById('search')
const countEl = document.getElementById('count');
const clearBtn = document.getElementById('clear');

let glossary = []

const sortMethods = {
    "alpha-ascend": (a,b) => a.term.localeCompare(b.term),
    "alpha-decend": (a,b) => b.term.localeCompare(a.term)
}

// Lowercases text, trims the ends, and collapses repeated spaces so matching is forgiving
function normalize(str) {
    return str.toLowerCase().trim().replace(/\s+/g, " ");
}

// Escapes special regex characters so user input
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Returns the text with every match of the query wrapped in a <mark> element
function highlight(text, query) {
    const frag = document.createDocumentFragment();
    if (!query) {
        frag.append(text);
        return frag;
    }

    const pattern = escapeRegExp(query).replace(/ /g, "\\s+");
    const regex = new RegExp(pattern, "gi");
    let last = 0;

    for (const m of text.matchAll(regex)) {
        //.matchAll finds every match of a regular expression in a string
        frag.append(text.slice(last, m.index));
        //.slice returns a piece of a string (or array) without changing the original
        const mark = document.createElement('mark');
        mark.textContent = m[0];
        frag.append(mark);
        last = m.index + m[0].length;
    }
    frag.append(text.slice(last));
    return frag;
}


async function loadGlossary(){
    try {
        const response = await fetch("glossary.json");
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`)
        
        glossary = await response.json();
        // renderGlossary(glossary);
        runSearch();

    } catch (error){
        console.error("Could not load", error)
        wrapper.textContent = "Sorry, the word could not be loaded.";
    }
}

function convertString(str){
    return str.toLowerCase().replaceAll(" ", "")
}

// document.getElementById('submit').addEventListener('click', function(){
//     const searchValue = convertString(document.getElementById('search').value)

//     let results = glossary.filter(g => convertString(g.term).includes(searchValue));
    
//     if(results.length === 0){
//         results = glossary.filter(g => convertString(g.definition).includes(searchValue));
//     }
//     renderGlossary(results.sort(sortMethods["alpha-ascend"]));

// });

function runSearch(){

    const query = normalize(searchInput.value);
    clearBtn.hidden = searchInput.value === "";


    // const searchValue = convertString(document.getElementById('search').value)

    // let results = glossary.filter(g => convertString(g.term).includes(searchValue));
    
    // if(results.length === 0){
    //     results = glossary.filter(g => convertString(g.definition).includes(searchValue));
    // }

    const results = glossary
        .filter(g =>
            normalize(g.term).includes(query) ||
            normalize(g.definition).includes(query)
        )
        .sort(sortMethods["alpha-ascend"]);

    renderGlossary(results, query);
}

function renderGlossary(g, query){
    wrapper.innerHTML = "";
    countEl.textContent = `Showing ${g.length} of ${glossary.length} terms`;


    if (g.length === 0) {
        document.getElementById('wrapper').innerHTML = "No word found base on your search";
        return;
    }

    g.forEach(item => {
        const card = document.createElement('div');
        card.className = 'entry';

        const term = document.createElement('h2');
        term.className = 'term';
        term.append(highlight(item.term, query));

        const def = document.createElement('p');
        def.className = 'definition';
        def.append(highlight(item.definition, query));

        card.append(term, def);
        wrapper.appendChild(card);
    });
}

searchInput.addEventListener('input', runSearch);

clearBtn.addEventListener('click', () => {
    searchInput.value = "";
    runSearch();
    searchInput.focus();
})

loadGlossary();