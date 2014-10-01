/** @jsx React.DOM */
var spaceSwitcher = React.createClass({displayName: 'spaceSwitcher',
    getInitialState: function() {
        return {
            data: [],
            active: -1
        };
    },
    makeIndex: function(data) {
        var q = [].concat(data);
        var index = [];
        while (q.length) {
            var item = q.shift();
            index.push({
                name: item.name,
                ref: item
            })
            if (item.spaces) {
                for (var i = item.spaces.length; i > 0; i--) {
                    q.unshift(item.spaces[i - 1]);
                }
            }

        }
        return index;
    },
    handleKeyDown: function(e) {
        if (e.keyCode == 40) {
            this.activeNext();
        } else if (e.keyCode == 38) {
            this.activePrev();
        }
    },
    activeNext: function() {
        var index = this.state.index;
        var active = this.state.active;

        if (active < index.length - 1) {
            index[active + 1].ref.active = true;
            if (active >= 0) {
                delete index[active].ref.active;
            }
            active++;
            this.setState({ active: active, index: index});
        }
    },
    activePrev: function() {
        var index = this.state.index;
        var active = this.state.active;
        if (active > 0) {
            index[active - 1].ref.active = true;
            if (active <= index.length) {
                delete index[active].ref.active;
            }
            active--;
            this.setState({ active: active, index: index});
        }
    },
    componentDidMount: function() {
        var that = this;
        app.getJSON(that.props.url, function(data) {
            that.setState({data: data, index: that.makeIndex(data)});
        })
        window.addEventListener('keydown', this.handleKeyDown);

    },
    onUpdate: function(data) {
        this.setState(data);
    },
    render: function() {
        return (
            <div className="space-switcher">
            Hello, world! I am a spaceSwitcher.
                <spaceSwitcherForm state={ this.state } onUpdate={ this.onUpdate }/>
                <spaceSwitcherList state={ this.state } />
            </div>
            );
    }
});

var spaceSwitcherForm = React.createClass({displayName: 'spaceSwitcherForm',
    getInitialState: function() {
        return {
            prevInput: '',
            prevScope: []
        };
    },

    handleInput: function(e) {
        e.preventDefault();
        var scope = [];
        var input = this.refs.spaceSwitcherSearchText.getDOMNode().value.trim();
        this.state.prevSearch;

        var stringIndex = function(name, input) {
            var name = name.toLowerCase();
            return input ? name.indexOf(input.toLowerCase()) : -1;
        }

        this.state.prevScope.forEach(function(item) {
            delete item.ref.isSearchResult;
            delete item.ref.searchName;
        })

        if (input && input.indexOf(this.state.prevInput) === 0 && this.state.prevInput !== "") {
            scope = this.state.prevScope.filter(function(item) {
                return stringIndex(item.name, input) != -1;
            })
        } else {
            scope = this.props.state.index
        }

        scope.forEach(function(item) {
            var i = stringIndex(item.name, input);

            if (i != -1) {
                item.ref.isSearchResult = true;
                item.ref.searchName = item.name.splice(i, 0, '<b>').splice(i + input.length + 3, 0, '</b>')
            }
        })

        this.props.onUpdate({data: this.props.state.data, index: this.props.state.index, input: input});
        this.state.prevInput = input;
        this.state.prevScope = scope;
    },
    render: function() {
        return (
            <form className="space-switcher__form">
                <input ref="spaceSwitcherSearchText" onInput={this.handleInput} type="text" class="space-switcher__search-text" name="space-switcher__search-text"/>
            </form>
            );
    }
});

var spaceSwitcherList = React.createClass({displayName: 'spaceSwitcherList',
    render: function() {
        var input = this.props.state.input;
        var organisationsNode = this.props.state.data.map(function(data) {
            return (
                <spaceSwitcherOrganisation input={input} data={data} />
                );
        });
        return (
            <div className="space-switcher__list">
                {organisationsNode}
            </div>
            );
    }
});

var spaceSwitcherOrganisation = React.createClass({displayName: 'spaceSwitcherOrganisation',
    render: function() {
        var org = this.props.data;
        var organisationSpacesNode = org.spaces.map(function(data) {
            return (
                <spaceSwitcherSpace data={data} />
                );
        });

        var checkInnerResults = function(array) {
            for (var i = 0; i < array.length; i++) {
                if (array[i].isSearchResult) {
                    return true;
                }
                return false;
            }
        }

        var name = org.isSearchResult ? org.searchName : org.name;
        var className = 'space-switcher__organisation';


        if (org.active) {
            className += '  active'
        }

        console.log(checkInnerResults(org.spaces))

        if (this.props.input && !org.isSearchResult && !checkInnerResults(org.spaces)) {
            className += '  hidden'
        }


        return (

            <div className={className}>

                <div dangerouslySetInnerHTML={{__html: name}} className="space-switcher__organisation-title"></div>
                <div className="space-switcher__spaces">
                    {organisationSpacesNode}
                </div>
            </div>
            );
    }
});

var spaceSwitcherSpace = React.createClass({displayName: 'spaceSwitcherSpace',
    render: function() {
        var space = this.props.data;

        var name = space.isSearchResult ? space.searchName : space.name;
        var className = space.active ? 'space-switcher__space active' : 'space-switcher__space ';
        return (
            <div  className={className}>
                <a dangerouslySetInnerHTML={{__html: name}} href={ space.url } className="space-switcher__space-title"></a>
            </div>
            );
    }
});

var app = {
    getJSON: function(url, successHandler, errorHandler) {
        var xhr = new XMLHttpRequest()
        xhr.open('get', url, true);
        xhr.onreadystatechange = function() {
            var status;
            var data;
            if (xhr.readyState == 4) {
                status = xhr.status;
                if (status == 200) {
                    data = JSON.parse(xhr.responseText);
                    successHandler && successHandler(data);
                } else {
                    errorHandler && errorHandler(status);
                }
            }
        };
        xhr.send();
    },

}

String.prototype.splice = function(idx, rem, s) {
    return (this.slice(0, idx) + s + this.slice(idx + Math.abs(rem)));
};

if (![].contains) {
    Object.defineProperty(Array.prototype, "contains", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(searchElement/*, fromIndex*/) {
            if (this === undefined || this === null)
                throw new TypeError("Cannot convert this value to object");
            var O = Object(this);
            var len = parseInt(O.length) || 0;
            if (len === 0) return false;
            var n = parseInt(arguments[1]) || 0;
            if (n >= len) return false;
            var k;
            if (n >= 0) {
                k = n;
            } else {
                k = len + n;
                if (k < 0) k = 0;
            }
            while (k < len) {
                var currentElement = O[k];
                if (searchElement === currentElement ||
                    searchElement !== searchElement && currentElement !== currentElement)
                    return true;
                k++;
            }
            return false;
        }
    });
}

React.renderComponent(
    <spaceSwitcher  url="data.json"/>,
    document.querySelector('div[component=spaceSwitcher]')
);