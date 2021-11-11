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

    };
    xhttp.open("GET", "./content/"+name+".html", true);
    xhttp.send();
};
