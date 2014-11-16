var App = React.createClass({
  getInitialState: function() {
      return {mainView: true,
              selectedFeed : ''}
  },
  handleBackButtonClick: function() {
    this.setState({mainView: true,
                  selectedFeed : ''});
  },
  handleFeedClick: function(item) {
    this.setState({mainView: false,
              selectedFeed : item});
  },
  handleNewComment: function(item) {
    this.setState({selectedFeed : item});
  },
  render: function() {
    var userIcon = currentUser.userIcon;
    return (
      <div> 
      <header>
        {!this.state.mainView ? <button onClick={this.handleBackButtonClick} className="customButton">Back</button> : null } 
        <img src={userIcon}/>
      </header>
      <div>     
          {this.state.mainView ?
          <Feed url="posts" handleClick={this.handleFeedClick}/> : <DetailView handleNewComment={this.handleNewComment} feedItem={this.state.selectedFeed}/>}
          </div>
      </div>
    );
  }
});

var DetailView = React.createClass({
    update: function(data) {
      this.props.handleNewComment(data);
    },
    render: function() {
      var feedItem = this.props.feedItem;
        return (
       <div><FeedItem feed={feedItem}>
       </FeedItem>
       <CommentBox update={this.update} feedItem={feedItem} url="posts"/></div>
        );
    }
});

  var CommentBox = React.createClass({
  handleCommentSubmit: function(comment) {
    var id =this.props.feedItem.id; 
    this.setState(null ,function() {
      $.ajax({
      url: this.props.url+ '/' +id,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data) {
        this.props.update(data);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
     });
    });
  },
  getInitialState: function() {
    return {data: []};
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
        var deleteNode = ((currentUser.userId==this.props.feed.authorId) ? <button className="deleteButton"  onClick={this.whenClickedDelete}>x</button>: null);
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
  },
  whenClicked: function(feedItem) {
    this.props.handleClick(feedItem);
  },
  onDelete: function(feedItem) {
    var id = feedItem.id; 
    this.setState(null, function() {
      $.ajax({
        url: this.props.url+ '/' +id,
        dataType: 'json',
        type: 'DELETE',
        data: feedItem,
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
    var feedItemNodes = this.state.data.map(function (feedItem) {
      return (
        <div>
        <FeedItem whenClicked={self.whenClicked.bind(null,feedItem)} onDelete={self.onDelete.bind(null,feedItem)}
         feed={feedItem}>
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
        <DeleteButton handleDelete={this.handleDelete} currentPostAuthorId={this.props.authorId} feed={this.props.feed}/>
        <div className="postAuthor">
          <img src={this.props.feed.iconUrl}/> 
          {this.props.feed.author}
          </div>
        {this.props.feed.timeStamp} ago
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
    var author = currentUser.userName;
    var iconUrl = currentUser.userIcon;
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

var currentUser= {
                userId: '123456',
                userIcon: 'http://files.softicons.com/download/business-icons/pretty-office-iv-icons-by-custom-icon-design/png/32/man2.png',
                userName: 'Jhon Smith'
              };
React.render(
   <App/>,
  document.getElementById('content')
);