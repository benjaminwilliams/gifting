var React = require('react');
var ReactDOM = require('react-dom');
var ReactRouter = require('react-router');
var createBrowserHistory = require('history/lib/createBrowserHistory');
var helpers = require('./helpers');
var ReBase = require('re-base'); //Firebase

var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var History = ReactRouter.History;


// Firebase intergration
var base = ReBase.createClass('https://osic-gifting.firebaseio.com/');


var App = React.createClass({
    getInitialState : function(){
        return {
            gifts : {},
            user: ""
        }
    },
    componentDidMount : function(){
        base.syncState("gifts", {
            context : this,
            state : 'gifts'
        });

    },

    addGift : function(gift){
        //var newGift = this.props.giftName;
        var timeStamp = (new Date()).getTime();
        var user = this.user;
        //if(!this.props.gifts[user]){
        //    this.props.gifts[user] = {};

        if(!this.state.gifts[user]){
            this.state.gifts[user] = {};
        }

        this.state.gifts[user]['gift-' + timeStamp] = gift;

        this.setState({gifts: this.state.gifts});
    },

    deleteGift : function(e){
        e.preventDefault();
        this.state.gifts[this.user][e.target.value] = null;
        this.setState({gifts: this.props.gifts});

    },

    render : function(){
        this.user = this.props.routeParams.userName;
        return (
            <div>
                <AddIdeas gifts={this.state.gifts} deleteGift={this.deleteGift} addGift={this.addGift} user={this.user} />
                <SeeIdeas gifts={this.state.gifts} user={this.user} />
            </div>
        )
    }
});



var AddIdeas = React.createClass({

    renderGifts : function(key){

        var user = this.props.user;

        var gift = this.props.gifts[key];

        for(var keyA in gift){
            if(gift.hasOwnProperty(keyA)){
                if(!keyA){
                    return <li key={keyA}>You havent added any ideas yet!</li>

                }

                return (
                    <li key={keyA}>
                        {gift[keyA].name}
                        <button value={keyA} onClick={this.props.deleteGift}> delete</button>
                    </li>
                )
            }
        }







    },
    createGift : function(e){
        e.preventDefault();
        var gift = {
            name : this.refs.name.value,
            taken : false
        };

        this.props.addGift(gift);

        this.refs.giftForm.reset();
    },
    render : function(){
        var user = this.props.user;
        var gifts = this.props.gifts;

        return (
            <div className="main">
                <h3> Welcome, {user} </h3>
                <p>here is a list of all your current gift ideas </p>
                <ul>
                    {Object.keys(gifts).map(this.renderGifts)}

                </ul>
                <form ref="giftForm" onSubmit={this.createGift}>
                    <input ref="name"/>
                    <button type="Submit">Add your idea</button>
                </form>
            </div>

        )
    }
});


var SeeIdeas = React.createClass({

    markGift : function(key){
        var currentGift = key;

        currentGift["taken"] = true;

        this.state.gifts[key] = currentGift;

       // this.setState({gifts: this.state.gifts});

    },
    renderGifts : function(key, user){
        var currentUser = this.props.user;

        var gift = this.props.gifts[currentUser][key];
        //var gift = key;


        if(!gift){
            return <li key={key}>No one has any ideas yet!</li>

        }

        if(user === currentUser){
            return <li key={key}>(hidden)</li>
        }
        return (
            <li key={key}>
                {gift.name}
                <a href="#" value={key} onClick={this.markGift(gift)}> mark as taken</a>
            </li>

        )
    },
    renderMembers : function(giftId){
        var self = this;
        var member = Object.keys(this.props.gifts[giftId]);
        var currentMember = this.props.user;


        if(!member){
            return <li key={giftId}>No one has any ideas yet!</li>

        }
        if(giftId === currentMember){
            return <li key={giftId} >hiding your stuffs</li>
        }

        return (
            <li key={giftId}>
                {giftId}
                <ul>
                    {member.map(function(a){
                        return self.renderGifts(a, giftId);

                    })}
                </ul>
            </li>
        )
    },
    render : function(){
        var user = this.props.user;
        var gifts = Object.keys(this.props.gifts);
        return (
            <div>
                <h2>{user}</h2>
                <ul>
                    {gifts.map(this.renderMembers)}
                </ul>
            </div>

        )
    }
});

var SelectUser = React.createClass({
    mixins : [
        History
    ],
    addIdeas : function(e){
        e.preventDefault();
        var userName = this.refs.userName.value;
        this.history.pushState(null, '/main/' + userName);

    },
    seeIdeas : function(e){
        e.preventDefault();
        var userName = this.refs.userName.value;
        this.history.pushState(null, '/main/' + userName);
    },
    render : function(){
       return (
           <form className="store-selector">
               {/* comment syntax is shit */}
               <h2>Who are you?</h2>
               <select ref="userName" required>
                    <option>Ben</option>
                   <option>Doug</option>
               </select>
               <p>Select an option below</p>
               <button onClick={this.addIdeas}>Add Ideas</button>
               <button onClick={this.seeIdeas}>See others gifts</button>
           </form>
       )

    }

});

/**
 * 404
 */
var NotFound = React.createClass({
    render: function(){
        return (
            <div>
                <h1>Page not found</h1>
                <a href='/'> home </a>
            </div>
        )
    }
});

/**
 * Routes
 */
var routes =(
    <Router history={createBrowserHistory()}>
        <Route path="/" component={SelectUser}/>
        <Route path="/main/:userName" component={App}/>
        <Route path="*" component={NotFound}/>
    </Router>
);
//
//<Route path="/add-ideas" component={AddIdeas}/>
//<Route path="/view-ideas" component={ViewIdeas}/>
//

//ReactDOM.render(<App />, document.querySelector('#app'));
ReactDOM.render(routes, document.querySelector('#main'));
