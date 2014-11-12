    var Feed = React.createClass({
      loadFeedItemFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadFeedItemFromServer();
    setInterval(this.loadFeedItemFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="feed">
         <FeedList data={this.state.data} />
      </div>
    );
  }
});

var FeedList = React.createClass({
    handleClick: function (i) {
      this.props.updateHeaderBackButton();
     React.render(
      // TODO: send correct id here
   <CommentBox url="comments" feedItem={this.props.data[0]} pollInterval={2000}/>,
  document.getElementById('content')
);
    },
  render: function() {
    var feedItemNodes = this.props.data.map(function (feedItem, i) {
      return (
        <FeedItem author={feedItem.author} iconUrl={feedItem.iconUrl} >
          {feedItem.timeStamp}
          {feedItem.postText}
          {feedItem.numberOfComments}
        </FeedItem>
      );
    });
    return (
      <div className="feedList"  onClick={this.handleClick.bind(this)}>
        {feedItemNodes}
      </div>
    );
  }
});

var FeedItem = React.createClass({
  render: function() {
    var divStyle = {
      border: 'solid',
      'margin-bottom': 15
    };
    return (
      <div>
      <div className="feedItemContainer" style={divStyle}>
        <h2 className="feedPost">
          <img src={this.props.iconUrl}/> 
          {this.props.author}
        </h2>
        {this.props.children[0]}
        <br/>
        {this.props.children[1]}
        <br/>
        {this.props.children[2]} Comments
      </div>
      </div>
    );
  }
});


var App = React.createClass({
  render: function() {
 
    return (
      <div> 
        <Header/>
        <Feed url="posts" pollInterval={2000}/>
      </div>
    );
  }
});

var Header = React.createClass({
  getInitialState: function() {
      return {fromFeed: false};
  },
  updateHeaderBackButton : function() {
    this.setState({
      fromFeed: true
    });
  },
  render: function(){
    var headerStyle = {
      height: 48,
      'background-color': 'blue',
      'margin-bottom': 15
    };
    return (
      <header style={headerStyle} className="header">
        { this.state.fromFeed ? <BackButton /> : null }
        </header>
      );
  }
});

var BackButton = React.createClass({
    render: function() {
        return (
            <button>
                Back
            </button>
        );
    }
});

React.render(
   <App/>,
  document.getElementById('content')
);

  var CommentBox = React.createClass({
  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment) {
    var comments = this.state.data;
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});
      $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="commentBox">
        <Header/>
        <FeedItem author={this.props.feedItem.author} icon={this.props.feedItem.iconUrl} >
          {this.props.feedItem.timeStamp}
          {this.props.feedItem.postText}
        </FeedItem>
        <CommentList data={this.state.data} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit}/>
      </div>
    );
  }
});

var CommentForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var author = "Ilmira";
    var iconUrl = "http://files.softicons.com/download/culture-icons/avatar-minis-icons-by-joumana-medlej/png/32x32/Matured%20Aang.png";
    var text = this.refs.text.getDOMNode().value.trim();
    if (!text) {
      return;
    }
    this.props.onCommentSubmit({author: author, text: text, iconUrl: iconUrl});
    this.refs.text.getDOMNode().value = '';
    return;
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Write a comment.." ref="text" />
        <input type="submit" value="Post" />
      </form>
    );
  }
});

var CommentList = React.createClass({
  render: function() {
    var commentNodes = this.props.data.map(function (comment) {
      return (
        <Comment author={comment.author} icon={comment.iconUrl}>
          {comment.text}
        </Comment>
      );
    });
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
});

var Comment = React.createClass({
  render: function() {
    return (
      <div className="comment"> 
        <h2 className="commentAuthor">
          <img src={this.props.icon}/>
          {this.props.author}
        </h2>
        {this.props.children}
      </div>
    );
  }
});