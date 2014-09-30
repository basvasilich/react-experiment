/** @jsx React.DOM */
var spaceSwitcher = React.createClass({displayName: 'spaceSwitcher',
    getInitialState: function() {
        return {data: []};
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
                item.spaces.forEach(function(item) {
                    q.push(item)
                })
            }

        }
        return index;
    },
    componentDidMount: function() {
        var that = this;
        app.getJSON(that.props.url, function(data) {
            that.setState({data: data, index: that.makeIndex(data)});
        })
    },
    onUpdate: function(data) {
        this.setState({
            data: data
        });
    },
    render: function() {
        return (
            <div className="space-switcher">
            Hello, world! I am a spaceSwitcher.
                <spaceSwitcherForm state={ this.state } onUpdate={ this.onUpdate }/>
                <spaceSwitcherList data={ this.state.data } />
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
            console.log(input, item)
            var i = stringIndex(item.name, input);

            if (i != -1) {
                item.ref.isSearchResult = true;
                item.ref.searchName = item.name.splice(i, 0, '<b>').splice(i + input.length + 3, 0, '</b>')
            }
        })

        this.props.onUpdate(this.props.state.data);
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
        var organisationsNode = this.props.data.map(function(data) {
            return (
                <spaceSwitcherOrganisation data={data} />
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

        var name = org.isSearchResult ? org.searchName : org.name;
        return (

            <div className="space-switcher__organisation">

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

        console.log(space.searchName)
        return (
            <div className="space-switcher__space">
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

React.renderComponent(
    <spaceSwitcher  url="data.json"/>,
    document.querySelector('div[component=spaceSwitcher]')
);