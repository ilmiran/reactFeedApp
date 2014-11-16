var App = React.createClass({
  getInitialState: function() {
      return {mainView: true,
              selectedFeed : '',
              currentUserId: '123456',
              currentUserIcon : 'http://files.softicons.com/download/culture-icons/avatar-minis-icons-by-joumana-medlej/png/32x32/Ty%20Lee.png'};
  },
  handleBackButtonClick: function() {
    this.setState({mainView: true,
                  selectedFeed : ''});
  },
  handleFeedClick: function(item) {
    this.setState({mainView: false,
              selectedFeed : item});
  },
  render: function() {
    return (
      <div> 
      <header>
        {!this.state.mainView ? <button onClick={this.handleBackButtonClick} className="customButton">Back</button> : null } 
        <img src={this.state.currentUserIcon}/>
      </header>
      <div>     
          {this.state.mainView ?
          <Feed userId={this.state.currentUserId} url="posts" handleClick={this.handleFeedClick} pollInterval={2000}/> : <DetailView feedItem={this.state.selectedFeed}/>}
          </div>
      </div>
    );
  }
});

var DetailView = React.createClass({
    render: function() {
      var feedItem = this.props.feedItem;
        return (
       <div><FeedItem feed={feedItem}>
          {feedItem.timeStamp}
       </FeedItem>
       <CommentBox feedItem={feedItem} pollInterval={2000} url="posts"/></div>
        );
    }
});

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
  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  handleCommentSubmit: function(comment) {
    var posts = this.state.data;
    var newComments = posts.concat([comment]);debugger;
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
      <div>
        <CommentList data={this.props.feedItem.comments} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit}/>
      </div>
    );
  }
});

var DeleteButton = React.createClass({
    whenClickedDelete: function() {
      this.props.handleDelete();
    },
    render: function() {
        var deleteNode = ((this.props.currentUserId==this.props.feed.authorId) ? <button className="deleteButton"  onClick={this.whenClickedDelete}>x</button>: null);
        return ( deleteNode );
    }
});


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
  componentWillMount: function() {
    this.loadFeedItemFromServer();
    setInterval(this.loadFeedItemFromServer, this.props.pollInterval);
  },
  whenClicked: function(feedItem) {
    this.props.handleClick(feedItem);
  },
  onDelete: function(feedItem) {
    var postId = feedItem.id;debugger;
    var posts = null;//TODOdebugger
    var newPosts = posts.filter(function(post) {
            return posts.id != postId;
        });
    this.setState({data: newPosts}, function() {
      // `setState` accepts a callback. To avoid (improbable) race condition,
      // `we'll send the ajax request right after we optimistically set the new
      // `state.
      $.ajax({
        url: this.props.url,
        dataType: 'json',
        type: 'DELETE',
        data: comment,
        success: function(data) {
          this.setState({data: data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });
    });
  },
  render: function() {
    var self = this;
    var currentUserId = this.props.userId;
    var feedItemNodes = this.state.data.map(function (feedItem) {
      return (
        <div>
        <FeedItem whenClicked={self.whenClicked.bind(null,feedItem)} onDelete={self.onDelete.bind(null,feedItem)} currentUserId={currentUserId}
         feed={feedItem}>
          {feedItem.comments.length}
        </FeedItem>
        </div>
      );
    });
    return (
      <div className="feedList">
        {feedItemNodes}
      </div>
    );
  }
});

var FeedItem = React.createClass({
  handleDelete: function() {
    this.props.onDelete();
  },
  handleClick: function() {
    this.props.whenClicked();
  },
  render: function() {
    var commentCount= this.props.feed.comments.length;
    return (
      <div className="feedItemContainer">
        <DeleteButton handleDelete={this.handleDelete} currentUserId={this.props.currentUserId} currentPostAuthorId={this.props.authorId} feed={this.props.feed}/>
        <div className="postAuthor">
          <img src={this.props.feed.iconUrl}/> 
          {this.props.feed.author}
          </div>
        {this.props.feed.timeStamp}
        <br/>
        {this.props.feed.postText}
        <br/>
        <p onClick={this.handleClick} className="comentsLink"> {commentCount} {(commentCount>0 && commentCount<=1) ? "Comment" : "Comments"}</p>
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
  onInput: function(e) {
    e.preventDefault();
    this.refs.post.getDOMNode().disabled = false;
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit} onInput={this.onInput}>
        <input type="text" placeholder="Write a comment.." ref="text" />
        <input type="submit" className="customButton postButton" value="Post" disabled="true" ref="post"/>
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
      <div className="coment"> 
        <h2 className="commentAuthor">
          <img src={this.props.icon}/>
          {this.props.author}
        </h2>
        {this.props.children}
      </div>
    );
  }
});

React.render(
   <App/>,
  document.getElementById('content')
);