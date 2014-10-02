/** @jsx React.DOM */
/* global React: true */

var app = {};
app.spaceSwitcher = React.createClass({displayName: 'spaceSwitcher',
    getInitialState: function() {
        return {
            data: [],
            active: -1,
            opened: false
        };
    },

    /**
     * Making index — flat array of data for traversing
     * @param {Array} data
     * @returns {Array}
     */
    makeIndex: function(data) {
        var q = [].concat(data);
        var index = [];
        while (q.length) {
            var item = q.shift();
            index.push({
                name: item.name,
                ref: item
            });
            if (item.spaces) {
                for (var i = item.spaces.length; i > 0; i--) {
                    q.unshift(item.spaces[i - 1]);
                }
            }
        }
        return index;
    },

    /**
     * Open control
     */
    open: function() {
        this.setState({opened: true});
    },
    /**
     * Close control
     */
    close: function() {
        this.setState({opened: false});
    },
    /**
     * Resizing control body to 80% of vieport
     */
    resize: function() {
        var control = this.refs.spaceSwitcher.getDOMNode();
        var list = this.refs.spaceSwitcherList.getDOMNode();
        var header = this.refs.spaceSwitcherHeader.getDOMNode();

        list.style.maxHeight = (window.innerHeight - control.offsetTop - header.offsetHeight - control.offsetHeight) * 0.8 + 'px';
        this.checkScroll();
    },
    /**
     * Click handler
     * @param e
     */
    handleClick: function(e) {
        e.preventDefault();
        if (this.state.opened) {
            this.close();
        } else {
            this.open();
        }
    },
    /**
     * Keydown handler
     * @param e
     */
    handleKeyDown: function(e) {
        switch (e.keyCode) {
            case 40:
                if (this.state.opened) {
                    this.activeNext();
                    this.checkScroll();
                }
                break;
            case 38:
                if (this.state.opened) {
                    this.activePrev();
                    this.checkScroll();
                }
                break;
            case  27:
                this.setState({opened: false});
                break;
            case 13:
                e.preventDefault();
                var url = this.state.index[this.state.active].ref.url;
                if (url) {
                    document.location = url;
                }
                break;
        }
    },
    /**
     * Check if active item visible on the list and scroll to if not
     */
    checkScroll: function() {
        var list = this.refs.spaceSwitcherList.getDOMNode();
        var active = list.querySelector('.space-switcher__organisation.is-active .space-switcher__organisation-title') || list.querySelector('.space-switcher__space.is-active');

        if (active && list.clientHeight + list.scrollTop < active.offsetTop) {
            list.scrollTop = active.offsetTop;
        } else if (active && active.offsetTop - active.clientHeight * 2 < list.scrollTop) {
            list.scrollTop = active.offsetTop - active.clientHeight * 2;
        }
    },
    /**
     * Sets active property to org/space object
     * @param item
     */
    makeActive: function(item) {
        var index = this.state.index;
        var active = this.state.active;
        if (item >= 0 && item < index.length) {
            if (active != -1) {
                delete index[active].ref.active;
            }
            index[item].ref.active = true;
            this.setState({ active: item });
        } else if (item < 0) {
            this.makeActive(0);
        } else {
            this.makeActive(index.length - 1);
        }
    },
    /**
     * Making active next element in index structire
     */
    activeNext: function() {
        var index = this.state.index;
        if (!this.state.input) {
            this.makeActive(this.state.active + 1);
        } else {
            for (var i = this.state.active + 1; i < index.length; i++) {
                if (index[i].ref.isSearchResult) {
                    this.makeActive(i);
                    break;
                }
            }
        }
    },
    /**
     * Making active prev element in index structire
     */
    activePrev: function() {
        var index = this.state.index;
        if (!this.state.input) {
            this.makeActive(this.state.active - 1);
        } else {
            for (var i = this.state.active - 1; i >= 0; i--) {
                if (index[i].ref.isSearchResult) {
                    this.makeActive(i);
                    break;
                }
            }
        }
    },
    componentDidMount: function() {
        this.setState({data: this.props.data, index: this.makeIndex(this.props.data)});
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('resize', this.resize);
        this.checkScroll();
    },
    componentWillUnmount: function() {
        window.removeEventListener('keydown', this.handleKeyDown);
    },
    componentDidUpdate: function() {
        this.resize();
    },

    /**
     * Search handler. Updating state of the control.
     * @param data
     */
    handleSearch: function(data) {
        for (var i = 0; i < data.index.length; i++) {
            if (data.index[i].ref.isSearchResult) {
                this.makeActive(i);
                break;
            }
        }
        this.setState(data);
    },
    render: function() {
        var className = 'space-switcher';

        if (this.state.opened) {
            className += ' is-opened';
        }

        return (
            /* jshint ignore:start */
            <div ref="spaceSwitcher"  className={className}>
                <a href="#" className="header__a space-switcher__toggler" onClick={ this.handleClick } >Go to space</a>

                <div ref="spaceSwitcherBody" className="space-switcher__body">
                    <div ref="spaceSwitcherHeader" className="space-switcher__header ">
                        <div className="space-switcher__form">
                            <app.spaceSwitcherForm state={ this.state } handleSearch={ this.handleSearch }/>
                        </div>
                    </div>
                    <div ref="spaceSwitcherList" className="space-switcher__list">
                        <app.spaceSwitcherList state={ this.state } />
                    </div>
                </div>
            </div>
            /* jshint ignore:end */
            );
    }
});

app.spaceSwitcherForm = React.createClass({displayName: 'spaceSwitcherForm',
    getInitialState: function() {
        return {
            prevInput: '',
            prevScope: []
        };
    },
    /**
     * Input handler. Caching scope for next search for performance.
     * Sets searchName property to org/space for highlightning
     * @param e
     */
    handleInput: function(e) {
        e.preventDefault();
        var scope = [];
        var input = encodeURIComponent(this.refs.spaceSwitcherSearchText.getDOMNode().value.trim().toLowerCase());

        var stringIndex = function(name, input) {
            var name = name.toLowerCase();
            return input ? name.indexOf(input.toLowerCase()) : -1;
        };

        this.state.prevScope.forEach(function(item) {
            delete item.ref.isSearchResult;
            delete item.ref.searchName;
        });

        if (input && input.indexOf(this.state.prevInput) === 0 && this.state.prevInput !== "") {
            scope = this.state.prevScope.filter(function(item) {
                return stringIndex(item.name, input) != -1;
            });
        } else {
            scope = this.props.state.index;
        }

        scope.forEach(function(item) {
            var i = stringIndex(item.name, input);

            if (i != -1) {
                item.ref.isSearchResult = true;
                item.ref.searchName = item.name.splice(i, 0, '<b>').splice(i + input.length + 3, 0, '</b>');
            }
        });

        this.props.handleSearch({
            data: this.props.state.data,
            index: this.props.state.index,
            input: input
        });

        this.setState({
            prevInput: input,
            prevScope: scope
        });
    },
    /**
     * Handle Enter and blur iput.
     * @param e
     */
    handleKeyDown: function(e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            this.refs.spaceSwitcherSearchText.getDOMNode().blur();
        }
    },
    componentDidMount: function() {
        window.addEventListener('keydown', this.handleKeyDown);
    },
    componentWillUnmount: function() {
        window.removeEventListener('keydown', this.handleKeyDown);
    },
    render: function() {
        return (
            /* jshint ignore:start */
            <form className="space-switcher__form__i">
                <input type="search" autoComplete="off" ref="spaceSwitcherSearchText" onInput={this.handleInput} type="text" className="space-switcher__search-text" name="space-switcher__search-text"/>
            </form>
            /* jshint ignore:end */
            );
    }
});

app.spaceSwitcherList = React.createClass({displayName: 'spaceSwitcherList',
    render: function() {
        var input = this.props.state.input; // jshint ignore:line
        var organisationsNode = this.props.state.data.map(function(data) { // jshint ignore:line
            return (
                /* jshint ignore:start */
                <app.spaceSwitcherOrganisation key={data.org_id} input={input} data={data} />
                /* jshint ignore:end */
                );
        });
        return (
            /* jshint ignore:start */
            <div className="space-switcher__list__i">
                {organisationsNode}
            </div>
            /* jshint ignore:end */
            );
    }
});

app.spaceSwitcherOrganisation = React.createClass({displayName: 'spaceSwitcherOrganisation',
    render: function() {
        var org = this.props.data;
        var input = this.props.input; // jshint ignore:line
        var organisationSpacesNode = org.spaces.map(function(data) { // jshint ignore:line
            return (
                /* jshint ignore:start */
                <app.spaceSwitcherSpace key={data.id} input={ input } data={data} />
                /* jshint ignore:end */
                );
        });

        var checkInnerResults = function(array) {
            for (var i = 0; i < array.length; i++) {
                if (array[i].isSearchResult) {
                    return true;
                }
            }
            return false;
        };

        var name = org.isSearchResult ? org.searchName : org.name; // jshint ignore:line
        var className = 'space-switcher__organisation';

        if (org.active) {
            className += '  is-active';
        }

        if (this.props.input && !org.isSearchResult && !checkInnerResults(org.spaces)) {
            className += '  is-hidden';
        }

        var backgroundImage = org.image && org.image.thumbnail_link ? 'url(' + org.image.thumbnail_link + ')' : 'none'; // jshint ignore:line

        return (
            /* jshint ignore:start */
            <div className={className} style={{'background-image': backgroundImage}}>
                <div dangerouslySetInnerHTML={{__html: name}} className="space-switcher__organisation-title"></div>
                <div className="space-switcher__spaces">
                    {organisationSpacesNode}
                </div>
            </div>
            /* jshint ignore:end */
            );
    }
});

app.spaceSwitcherSpace = React.createClass({displayName: 'spaceSwitcherSpace',
    render: function() {
        var space = this.props.data;

        var name = space.isSearchResult ? space.searchName : space.name; // jshint ignore:line
        var className = 'space-switcher__space';

        if (space.active) {
            className += '  is-active';
        }

        if (this.props.input && !space.isSearchResult) {
            className += '  is-hidden';
        }

        return (
            /* jshint ignore:start */
            <div  className={className}>
                <a dangerouslySetInnerHTML={{__html: name}} href={ space.url } className="space-switcher__space-title space-switcher__a"></a>
            </div>
            /* jshint ignore:end */
            );
    }
});

