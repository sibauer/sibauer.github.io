function loadcontent(name){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("content").innerHTML = this.responseText;

            var navlinks = document.getElementsByClassName("nav-link");
            for (var i = 0; i < navlinks.length; i++) {
                var navlink = navlinks[i];
                navlink.classList.remove("active");
            };
            document.getElementById('navlink_'+name).classList.add("active");
        };
        publications();
    };
    xhttp.open("GET", "./content/"+name+".html", true);
    xhttp.send();
};


// Get paper from semantic via id
function getPublicationDetails(id){
    url="https://api.semanticscholar.org/graph/v1/paper";
    fields = "title,authors,citationCount,year,abstract,url,externalIds,venue"

    var r = new Request(url+"/"+id+"?fields="+fields);
    return fetch(r).then(function(response) {
        return response.json();
    }).then(function(details) {

            // Format venue
            // Nature communications
            if(details.venue.toLowerCase().includes("nature communications")){
                details.venue = "Nat. Com.";
            }
            // Proceedings of the National Academy of Sciences
            if(details.venue.toLowerCase().includes("proceedings of the national academy of sciences")){
                details.venue = "PNAS";
            }
            // Plos comp biol
            if(details.venue.toLowerCase().includes("plos") && details.venue.toLowerCase().includes("bio")){
                details.venue = "PLoS Comp. Biol.";
            }
            
            return details;
    });
}

/** Create dom from details
 * 
 * @param {dict} details dict containing details of publication, i.e.
 *  - title
 *  - authors
 *  - year
 *  - abstract
 *  - url
 *  - externalIds
 *  - citationCount
 *  - paperId  
 */
function detailsToDom(details, overwrite){
    let div = document.createElement("div");
    div.classList.add("publication");

    /** -------------------------------------------
     * Header with title and link to journal
     * -------------------------------------------*/
    //container
    var header = document.createElement("div");
    header.classList.add("publication-header");

    //title
    let title = document.createElement("h4");
    title.innerText = details.title;
    header.appendChild(title);

    // Link to journal
    let journal = document.createElement("a");
    journal.href = "https://doi.org/"+details.externalIds.DOI;

    let text_j = document.createElement("div");
    text_j.classList.add("publication-journal");
    if (details.venue){
        text_j.innerHTML = details.venue + "<br>" + details.year;
    } else {
        text_j.innerHTML = "ArXiv<br>" + details.year;
    }
    journal.appendChild(text_j);
    header.appendChild(journal);
    div.appendChild(header);


    /** --------------------------------
     * Authors
     * -------------------------------- */

    // Author list with links
    let authors = document.createElement("div");
    authors.classList.add("publication-authors");
    let text = document.createElement("p");
    text.innerText = "Authors:";
    authors.appendChild(text);
    let ul = document.createElement("ul");
    details.authors.forEach(function(author){
        let li = document.createElement("li");
        let a = document.createElement("a");
        a.href = "https://www.semanticscholar.org/author/"+author.authorId;
        a.innerText = author.name;
        li.appendChild(a);
        ul.appendChild(li);
    });
    authors.appendChild(ul);
    div.appendChild(authors);

    /** --------------------------------
     * Abstract
     * --------------------------------- */
    let abstract_text = details.abstract;
    if (overwrite.abstract != null){
        abstract_text = overwrite.abstract;
    }

    //Container
    let abstract = document.createElement("div");
    abstract.classList.add("publication-abstract");
    
    //Header
    let text_prefix= document.createElement("p");
    text_prefix.innerHTML = "<em>Abstract:</em> ";
    
    //Text from semantic
    text_prefix.innerHTML += abstract_text;
    abstract.appendChild(text_prefix);


    div.appendChild(abstract);
    
    return div;
}



function publications(){
    // Get all publications
    var pub_container = document.getElementsByClassName("publication-container");

    // For each publication retrieve details, than
    Array.from(pub_container).forEach(element => {
        getPublicationDetails(element.dataset.id)
            .then(function(details){
                element.appendChild(detailsToDom(details, element.dataset));
            });
    });
}