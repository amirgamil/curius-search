// only fire fn once it hasn't been called in delay ms
const debounce = (fn, delay) => {
    let to = null;
    return (...args) => {
        const bfn = () => fn(...args);
        clearTimeout(to);
        to = setTimeout(bfn, delay);
    };
};

class Data extends Atom {}

//takes a string of content and returns
//a text with HTML tags injected for key query words
const highlightContent = (text, query) => {
    const regex = new RegExp(query.join(" "));
    return text.replace(regex, `<span class="highlighted">${query[0]}</span>`);
};

class SearchResults extends CollectionStoreOf(Data) {
    fetch(query) {
        return fetch("/search?q=" + encodeURIComponent(query), {
            method: "POST",
            mode: "no-cors",
            // headers: {
            //     "Accept-Encoding": "gzip, deflate"
            // },
            body: JSON.stringify(),
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    Promise.reject(response);
                }
            })
            .then((result) => {
                if (result) {
                    //time comes back in nanoseconds
                    this.time = result.time * 0.000001;
                    this.query = result.query;
                    this.setStore(
                        result.data.map((element, id) => {
                            element["selected"] = id === 0 ? true : false;
                            element["content"] = highlightContent(element["content"], this.query);
                            return new Data(element);
                        })
                    );
                } else {
                    this.setStore([]);
                }
            })
            .catch((ex) => {
                console.log("Exception occurred trying to fetch the result of a request: ", ex);
            });
    }
}

class Result extends Component {
    init(data, removeCallBack) {
        this.data = data;
        this.removeCallBack = removeCallBack;
        this.displayDetails = false;
        this.loadPreview = this.loadPreview.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.bind(data);
    }

    loadPreview() {
        //fetch the full text
        fetch("/getRecordDetail?q=" + this.data.get("title"), {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify(),
        })
            .then((data) => {
                console.log("data: ", data);
                return data.json();
            })
            .then((res) => {
                this.displayDetails = true;
                //add highlighting
                this.data.update({ fullContent: res });
            })
            .catch((ex) => {
                console.log("Error fetching details of item: ", ex);
            });
    }

    closeModal(evt) {
        //stop bubbling up DOM which would cancel this action by loading preview
        evt.stopPropagation();
        this.displayDetails = false;
        this.render();
    }

    create({ title, link, content, selected, fullContent }) {
        const contentToDisplay = content + "...";
        return html`<div class="result colWrapper ${selected ? "hoverShow" : ""}" onclick=${this.loadPreview}>
            <a onclick=${(evt) => evt.stopPropagation()} href=${link}>${title}</a>
            <p innerHTML=${contentToDisplay}></p>
            ${this.displayDetails
                ? html`<div class="modal">
                      <div class="modalContent">
                          <div class="windowBar">
                              <p class="modalNavTitle">details.txt</p>
                              <div class="navPattern"></div>
                              <button class="closeModal" onclick=${this.closeModal}>x</button>
                          </div>
                          <div class="modalBody">
                              <div class="rowWrapper">
                                  <h2>${title}</h2>
                              </div>
                              <p><a href=${link}>Source</a></p>
                              <p innerHTML=${fullContent}></p>
                          </div>
                      </div>
                  </div>`
                : null}
        </div>`;
    }
}

class SearchResultsList extends ListOf(Result) {
    create() {
        return html`<div class="colWrapper">${this.nodes}</div>`;
    }
}

class SearchEngine extends Component {
    init(router, query) {
        this.router = router;
        this.query = query;
        this.searchInput = "";
        this.searchData = new SearchResults();
        this.searchResultsList = new SearchResultsList(this.searchData);
        this.handleInput = this.handleInput.bind(this);
        this.loading = false;
        this.modalT;
        //used to change selected results based on arrow keys
        this.selected = 0;
        this.time = "";
        //add a little bit of delay before we search because too many network requests
        //will slow down retrieval of search results, especially as user is typing to their deired query
        //each time the user lifts up their finger from the keyboard, debounce will fire which will
        //check if 500ms has elapsed, if it has, will query and load the search results,
        //otherwise if it's called again, rinse and repeat
        this.loadSearchResults = debounce(this.loadSearchResults.bind(this), 500);
        this.setSearchInput = this.setSearchInput.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
        this.toggleSelected = this.toggleSelected.bind(this);
        //if we have a query on initialization, navigate to it directly
        if (this.query) {
            this.setSearchInput(this.query);
            this.loadSearchResults(this.query);
        }
    }

    //TODO: add pagination into API to return e.g. 20 results and load more for speed
    loadSearchResults(evt) {
        if (evt.key === "ArrowDown" || evt.key === "ArrowUp" || evt.key === "Enter" || evt.key === "Escape") {
            return;
        }
        this.searchData
            .fetch(this.searchInput)
            .then(() => {
                this.loading = false;
                this.render();
            })
            .catch((ex) => {
                //if an error occured, page won't render so need to call render to update with error message
                this.render();
            });
    }

    setSearchInput(value) {
        this.searchInput = value;
    }

    handleInput(evt) {
        this.setSearchInput(evt.target.value);
        this.router.navigate("/search?q=" + encodeURIComponent(evt.target.value));
        this.loading = true;
        this.render();
        //get search results
        // this.loadSearchResults(this.searchInput);
    }

    styles() {
        return css`
            .engineTitle {
                align-self: center;
            }
            .blue {
                color: #2a63bf;
            }

            .red {
                color: #e34133;
            }
            .yellow {
                color: #f3b828;
            }
            .green {
                color: #32a556;
            }
        `;
    }

    toggleSelected(state) {
        const listSize = this.searchResultsList.size;
        switch (state) {
            case "ArrowDown":
                this.selected += 1;
                if (this.selected < listSize) {
                    window.scrollBy(0, 100);
                    this.searchResultsList.nodes[this.selected - 1].data.update({ selected: false });
                    this.searchResultsList.nodes[this.selected].data.update({ selected: true });
                } else {
                    window.scrollTo(0, 0);
                    this.selected = 0;
                    this.searchResultsList.nodes[this.selected].data.update({ selected: true });
                    this.searchResultsList.nodes[listSize - 1].data.update({ selected: false });
                }
                break;
            case "ArrowUp":
                this.selected -= 1;
                if (this.selected >= 0) {
                    window.scrollBy(0, -100);
                    this.searchResultsList.nodes[this.selected + 1].data.update({ selected: false });
                    this.searchResultsList.nodes[this.selected].data.update({ selected: true });
                } else {
                    window.scrollBy(0, document.body.scrollHeight);
                    this.selected = listSize - 1;
                    this.searchResultsList.nodes[0].data.update({ selected: false });
                    this.searchResultsList.nodes[this.selected].data.update({ selected: true });
                }
        }
        this.searchResultsList.nodes[this.selected].render();
    }

    handleKeydown(evt) {
        //deal with cmd a + backspace should empty all search results
        if (evt.key === "ArrowDown" || evt.key === "ArrowUp") {
            //change the selected attribute
            evt.preventDefault();
            this.toggleSelected(evt.key);
        } else if (evt.key === "Enter") {
            evt.preventDefault();
            this.searchResultsList.nodes[this.selected].loadPreview();
        } else if (evt.key === "Escape") {
            evt.preventDefault();
            this.searchResultsList.nodes[this.selected].displayDetails = false;
            this.searchResultsList.nodes[this.selected].render();
        }
    }

    create() {
        const time = this.searchData.time ? this.searchData.time.toFixed(2) : 0
        return html`<div class = "engine">
            <h1 class="engineTitle"><span class="blue">A</span><span class="red">p</span><span class="yellow">o</span><span class="blue">l</span><span class="green">l</span><span class="yellow">o</span>-<span class="blue">C</span><span class="red">u</span><span class="yellow">r</span><span class="blue">i</span><span class="green">u</span><span class="yellow">s</span></h1>
            <input onkeydown=${this.handleKeydown} oninput=${this.handleInput} onkeyup=${this.loadSearchResults} value=${this.searchInput} placeholder="Search my curius footprint"/>
            <p class="time">${this.searchInput ? "About " + this.searchData.size + " results (" + time + "ms)" : html`<p>To navigate with your keyboard: <strong>Arrow keys</strong> move up and down results, <strong>Enter</strong> opens the result in detail, <strong>Escape</strong>
            closes the detail view</p>`}</p>
            ${this.loading ? html`<p>loading...</p>` : this.searchResultsList.node} 
        </div>`;
    }
}


const about = html`<div class="colWrapper">
    <h1>About</h1>
    <p>
        Apollo-curius is a search engine based off <a href="https://github.com/amirgamil/apollo">Apollo</a> which
        indexes my <a href="https://curius.app/amir-gamil">Curius</a> data.
    </p>
</div>`;

class App extends Component {
    init() {
        this.router = new Router(3);
        this.router.on({
            route: "/search",
            handler: (route, params) => {
                this.engine = new SearchEngine(this.router, params["q"]);
                this.route = route;
                this.render();
            },
        });

        this.router.on({
            route: "/about",
            handler: (route) => {
                this.route = route;
                this.render();
            },
        });

        this.router.on({
            route: "/",
            handler: (route) => {
                this.engine = new SearchEngine(this.router);
                this.route = route;
                this.render();
            },
        });
    }

    create() {
        const hour = new Date().getHours();
        if (hour > 19 || hour < 7) {
            document.body.classList.add("dark");
            document.documentElement.style.color = "#222";
        } else {
            document.body.classList.remove("dark");
            document.documentElement.style.color = "#fafafa";
        }
        return html`<main>
            <nav>
                <div class="topNav">
                    <h5 class="titleNav"><strong class="cover">Apollo-Curius</strong></h5>
                    <h5 class="welcomeNav">Amir's Digital 👣</h5>
                    <div class="navSubar">
                        <button title="Home" onclick=${() => this.router.navigate("/")}>
                            <img src="static/img/home.png" />
                        </button>
                        <button title="About" onclick=${() => this.router.navigate("/about")}>
                            <img src="static/img/about.png" />
                        </button>
                        <input class="navInput" placeholder=${window.location.href} />
                    </div>
                </div>
            </nav>
            <div class="content">
                ${() => {
                    switch (this.route) {
                        case "/about":
                            return about;
                        default:
                            return this.engine.node;
                    }
                }}
            </div>
            <footer>
                Built with <a href="https://github.com/amirgamil/poseidon">Poseidon</a> by
                <a href="https://amirbolous.com/">Amir</a> and
                <a href="https://github.com/amirgamil/curius-search">open source</a> on GitHub
            </footer>
        </main>`;
    }
}

const app = new App();
document.body.appendChild(app.node);
