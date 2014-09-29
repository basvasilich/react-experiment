/** @jsx React.DOM */
var spaceSwitcher = React.createClass({displayName: 'spaceSwitcher',
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount: function() {
        var that = this;
        app.getJSON(that.props.url, function(data) {
            that.setState({data: data});
        })
    },
    onUpdate: function(data) {
        this.setState({
            data: data
        });
    },
    render: function() {
        console.log('state', this.state.data)
        return (
            <div className="space-switcher">
            Hello, world! I am a spaceSwitcher.
                <spaceSwitcherForm  onUpdate={ this.onUpdate }/>
                <spaceSwitcherList data={ this.state.data } />
            </div>
            );
    }
});

var spaceSwitcherForm = React.createClass({displayName: 'spaceSwitcherForm',
    handleInput: function(e) {
        e.preventDefault();
        var input = this.refs.spaceSwitcherSearchText.getDOMNode().value.trim();
        console.log(input)
        if (!input) {
            return;
        }
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

        var selection = org.isSearchResult ? '+ ' : '';
        return (

            <div className="space-switcher__organisation">

                <div className="space-switcher__organisation-title">
                    {selection}
                    {org.name}
                </div>
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
        return (
            <div className="space-switcher__space">
                <a href={ space.url } className="space-switcher__space-title">
                    { space.name }
                </a>
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
    }
}


React.renderComponent(
    <spaceSwitcher  url="data.json"/>,
    document.querySelector('div[component=spaceSwitcher]')
);