(function (window) {

    'use strict';

    var laravelAdminExpandTable = {
        current_page: 1,
        limit: 10,
        url: '',
        params: {},
        columns: {},
        init: function (url, params={}, columns={}, limit=10) {
            this.url = url;
            this.params = params;
            this.limit = limit;
            this.columns = columns;
            return this;
        },
        make: function (title) {
            this.current_page = 1;
            this._requestBlock = false;
            this._modalBodyNode = null;
            this._boxNode = null;
            this._boxBodyNode = null;
            this._boxFootNode = null;
            this._paginationNode = null;
            this._tableNode = null;
            this._loadingNode = null;
            let modal_body = this._createModal(title);

            this._createBox(modal_body);
        },
        _requestBlock:false,
        _modalBodyNode:null,
        _boxNode:null,
        _boxBodyNode: null,
        _boxFootNode: null,
        _paginationNode: null,
        _tableNode: null,
        _loadingNode:null,
        _loading:function(remove=false){
            if(remove){
                laravelAdminExpandTable._modalBodyNode.removeChild(this._loadingNode);
                this._loadingNode = null;
                return;
            }
            if(this._loadingNode instanceof HTMLElement){
                return;
            }
            let svg = "<svg version=\"1.1\" style='width: 100%;height:100px' xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n" +
                "   width=\"40px\" height=\"40px\" viewBox=\"0 0 40 40\" enable-background=\"new 0 0 40 40\" xml:space=\"preserve\">\n" +
                "  <path opacity=\"0.2\" fill=\"#000\" d=\"M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946\n" +
                "    s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634\n" +
                "    c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z\"/>\n" +
                "  <path fill=\"#000\" d=\"M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0\n" +
                "    C22.32,8.481,24.301,9.057,26.013,10.047z\">\n" +
                "    <animateTransform attributeType=\"xml\"\n" +
                "      attributeName=\"transform\"\n" +
                "      type=\"rotate\"\n" +
                "      from=\"0 20 20\"\n" +
                "      to=\"360 20 20\"\n" +
                "      dur=\"0.5s\"\n" +
                "      repeatCount=\"indefinite\"/>\n" +
                "    </path>\n" +
                "  </svg>";
            let loading = document.createElement('div');
            loading.style = 'width: 100%;height: 100px;';
            loading.innerHTML = svg;
            this._loadingNode = loading;
            let firstChild = laravelAdminExpandTable._modalBodyNode.childNodes[0];
            if(firstChild  instanceof HTMLElement){
                laravelAdminExpandTable._modalBodyNode.insertBefore(loading,firstChild);
                return;
            }
            laravelAdminExpandTable._modalBodyNode.append(loading);
        },
        _request: function (url, data) {
            if(this._requestBlock){
                return;
            }
            //loading
            this._loading();
            var xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.timeout = 3000;
            xhr.responseType = "json";
            var token= document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8");
            xhr.setRequestHeader("X-CSRF-TOKEN", token);
            xhr.send(JSON.stringify(data));
            this._requestBlock = true;
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    laravelAdminExpandTable._loading(true);
                    var response = xhr.response;
                    if((laravelAdminExpandTable._boxFootNode instanceof HTMLElement) && (laravelAdminExpandTable._paginationNode instanceof HTMLElement)) {
                        laravelAdminExpandTable._boxFootNode.removeChild(laravelAdminExpandTable._paginationNode);
                    }
                    laravelAdminExpandTable._makeTableContent(response);
                }
                laravelAdminExpandTable._requestBlock = false;
            };
            xhr.onerror = function (e) {
                console.log(e)
            };
        },
        _makeTableContent:function(response) {
            //create pagination and table
            let ul = this._createPage(this.current_page,response.total);
            this._paginationNode = ul;
            this._boxNode.append(ul);

            this._paginationNode = ul;
            this._boxFootNode.textContent = "总共 "+response.total+ "条";
            this._boxFootNode.append(ul);
            this._boxNode.append(this._boxFootNode);
            this._modalBodyNode.append(this._boxNode);
            this._createTable(this.current_page,response.data);
        },
        _createPage: function (current_page,total) {
            let ul = document.createElement("ul");
            ul.className = "pagination pagination-sm no-margin pull-right";
            <!-- Array Of Links -->
            //left
            var total_page = Math.ceil(total / this.limit);
            var Pagination = {
                _clickEvent: function () {
                    //reset
                    laravelAdminExpandTable.current_page = parseInt(this.getAttribute('data-p'));
                    laravelAdminExpandTable.params.p = parseInt(this.getAttribute('data-p'));
                    laravelAdminExpandTable._request(laravelAdminExpandTable.url,laravelAdminExpandTable.params);
                },
                _currentPadding: function () {
                    let c_li = document.createElement('li');
                    c_li.className = "page-item active";
                    c_li.innerHTML = "<span class=\"page-link\">" + current_page + "</span>";
                    ul.append(c_li);
                    return c_li;
                },
                _leftPadding: function (c_li) {
                    var temP = current_page;
                    var temNode = c_li;
                    if (current_page > 7) {
                        var i = 1;
                        while (temP > 1 && i <= 3) {
                            temP--;
                            let li = document.createElement('li');
                            li.className = "page-item";
                            li.setAttribute('data-p', temP);
                            li.innerHTML = "<a class='page-link' href='javascript:void(0);'>" + temP + "</a>";
                            ul.insertBefore(li, temNode);
                            temNode = li;
                            //add event
                            li.addEventListener('click', Pagination._clickEvent);
                            i++;
                        }
                        var ellipsis = document.createElement('li');
                        ellipsis.className = "page-item disabled";
                        ellipsis.innerHTML = "<span class=\"page-link\">...</span>";
                        ul.insertBefore(ellipsis, temNode);

                        if (current_page > 1) {
                            let f_li = document.createElement('li');
                            f_li.className = "page-item";
                            f_li.setAttribute('data-p', "1");
                            f_li.innerHTML = "<a class='page-link' href='javascript:void(0);'>" + 1 + "</a>";
                            f_li.addEventListener('click', Pagination._clickEvent);
                            ul.insertBefore(f_li, ellipsis);
                        }
                    } else {
                        while (temP > 1) {
                            temP--;
                            let li = document.createElement('li');
                            li.className = "page-item";
                            li.setAttribute('data-p', temP);
                            li.innerHTML = "<a class='page-link' href='javascript:void(0);'>" + temP + "</a>";
                            ul.insertBefore(li, temNode);
                            temNode = li;
                            li.addEventListener('click', Pagination._clickEvent)
                        }
                    }
                },
                _rightPadding: function () {
                    var temP = current_page;
                    if (total_page - current_page > 6) {
                        var i = 1;
                        while (temP < total_page && i <= 3) {
                            temP++;
                            let li = document.createElement('li');
                            li.className = "page-item";
                            li.setAttribute('data-p', temP);
                            li.innerHTML = "<a class='page-link' href='javascript:void(0);'>" + temP + "</a>";
                            ul.append(li);
                            li.addEventListener('click', Pagination._clickEvent);
                            i++;
                        }
                        var ellipsis = document.createElement('li');
                        ellipsis.className = "page-item disabled";
                        ellipsis.innerHTML = "<span class=\"page-link\">...</span>";
                        ul.append(ellipsis);

                        if (current_page < total) {
                            let r_li = document.createElement('li');
                            r_li.className = "page-item";
                            r_li.setAttribute('data-p', total);
                            r_li.innerHTML = "<a class='page-link' href='javascript:void(0);'>" + total + "</a>";
                            r_li.addEventListener('click', Pagination._clickEvent);
                            ul.append(r_li);
                        }
                    } else {
                        while (temP < total_page) {
                            temP++;
                            let li = document.createElement('li');
                            li.className = "page-item";
                            li.setAttribute('data-p', temP);
                            li.innerHTML = "<a class='page-link' href='javascript:void(0);'>" + temP + "</a>";
                            li.addEventListener('click', Pagination._clickEvent);
                            ul.append(li);
                        }
                    }
                },
                _previous: function (ul) {
                    <!-- Previous Page Link -->
                    let previous = document.createElement("li");
                    previous.className = "page-item";
                    previous.innerHTML = "<a class='page-link' href='javascript:void(0);'>«</a>";
                    let previousP = parseInt(current_page) - 1;
                    if (previousP >= 1) {
                        previous.setAttribute('data-p', previousP);
                        previous.addEventListener('click', Pagination._clickEvent);
                    }
                    ul.insertBefore(previous, ul.children[0]);
                    return this;
                },
                _next: function (ul) {
                    <!-- Next Page Link -->
                    let next = document.createElement("li");
                    next.className = "page-item";
                    next.innerHTML = "<a class='page-link' href='javascript:void(0);'>»</a>";
                    let nextP = parseInt(current_page) + 1;
                    if (total_page >= nextP) {
                        next.setAttribute('data-p', nextP);
                        next.addEventListener('click', Pagination._clickEvent);
                    }
                    ul.append(next);
                    return this;
                }
            };

            var c_li = Pagination._currentPadding();
            Pagination._leftPadding(c_li);
            Pagination._rightPadding();
            Pagination._previous(ul)._next(ul);
            return ul;
        },
        _createTable: function (p,data) {
            if (((this._boxBodyNode instanceof HTMLElement) != false) && ((this._tableNode instanceof HTMLElement) != false)) {
                this._boxBodyNode.removeChild(this._tableNode);
            }
            let table = document.createElement('table');
            table.className = "table table-hover grid-table";
            let head = document.createElement('thead');
            let h_tr = document.createElement('tr');

            for (let key in laravelAdminExpandTable.columns) {
                let name = laravelAdminExpandTable.columns[key];
                let th = document.createElement('th');
                th.textContent = name;
                h_tr.append(th);
            }

            let tbody = document.createElement('tbody');
            for (let k in data){
                let d = data[k];
                let tr = document.createElement('tr');
                tr.textContent = name;
                for(let key in laravelAdminExpandTable.columns){
                    if (!d.hasOwnProperty(key)){
                        continue;
                    }
                    let td = document.createElement('td');
                    td.innerHTML = d[key];
                    tr.append(td);
                }
                tbody.append(tr);
            }

            head.append(h_tr);
            table.append(head);
            table.append(tbody);
            this._boxBodyNode.append(table);
            this._tableNode = table;
        },
        _createBox: function () {
            let box = document.createElement("div");
            box.className = "box grid-box";
            let box_body = document.createElement("div");
            box_body.className = "box-body table-responsive no-padding";
            let box_foot = document.createElement("div");
            box_foot.className = "box-footer clearfix";

            box.append(box_body);
            this._boxNode = box;
            this._boxBodyNode = box_body;
            this._boxFootNode = box_foot;
            //request table data
            this.params.p = this.current_page;
            this.params.limit = this.limit;
            this._request(this.url,this.params);
            return;
        },
        _createModal: function (title) {
            //modal
            let modal = document.createElement("div");
            modal.setAttribute('class', 'modal grid-modal in');
            modal.setAttribute('tabindex', '-1');
            modal.setAttribute('role', 'dialog');
            modal.style = 'display: block;';

            //modal_dialog
            let mod_dialog = document.createElement("div");
            mod_dialog.setAttribute('class', 'modal-dialog modal-lg');
            mod_dialog.setAttribute('role', 'document');

            //modal_content
            let modal_content = document.createElement("div");
            modal_content.className = "modal-content";

            //header
            let modal_header = document.createElement("div");
            modal_header.className = 'modal-header';
            modal_header.style = 'background-color:#ffffff';
            //X
            let X = document.createElement("button");
            X.setAttribute('type', 'button');
            X.setAttribute("class", 'close');
            X.setAttribute('aria-label', 'Close');
            X.style = "font-size: 33px;";
            X.innerHTML = "<span aria-hidden=\"true\">×</span>";
            X.addEventListener('click', function () {
                document.body.removeChild(modal);
            });
            let T = document.createElement("h4");
            T.className = "modal-title";
            T.textContent = title;

            let modal_body = document.createElement('div');
            modal_body.className = "modal-body";
            modal_body.style = 'background-color:#f4f4f4';
            this._modalBodyNode = modal_body;
            this._loading();
            //create modal
            modal_header.append(X);
            modal_header.append(T);
            modal_content.append(modal_header);
            modal_content.append(modal_body);
            mod_dialog.append(modal_content);
            modal.appendChild(mod_dialog);
            document.body.append(modal);
            return modal_body;
        }
    };

    if (typeof define === 'function' && define.amd) {
        // AMD
        define(laravelAdminExpandTable);
    } else {
        window.laravelAdminExpandTable = laravelAdminExpandTable;
    }
})(window);
