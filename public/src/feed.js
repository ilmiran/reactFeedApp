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
  handleScroll: function(e){
  var header = this.root.querySelector('.header');
  var origOffsetY = header.offsetTop;
  window.scrollY >= origOffsetY ? header.addClass('sticky'): header.removeClass('sticky');
  },
  render: function() {
    var userIcon = currentUser.userIcon;
    var backButtonStyle = {'margin' : 8};
    return (
      <div> 
      <header className="header">
        {!this.state.mainView ? <button style={backButtonStyle} onClick={this.handleBackButtonClick} className="customButton">Back</button> : null } 
        <img src={userIcon}/>
      </header>
      <div onScroll={this.handleScroll}>     
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
       <div><FeedItem feed={feedItem} detailView={true}/>
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
      var answer = window.confirm("Are you sure?");
      if(answer){
        this.props.handleDelete();
      }
      // this.setState({promptDelete: true});
    },
    getInitialState: function() {
      return {promptDelete: false};
    },
    render: function() {
        var deleteNode = ((currentUser.userId==this.props.feed.authorId) ? <button className="deleteButton"  onClick={this.whenClickedDelete}>x</button>: null);
        return (deleteNode);
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
         feed={feedItem}/>
       
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
        { this.props.detailView ? null :
        <DeleteButton handleDelete={this.handleDelete} currentPostAuthorId={this.props.authorId} feed={this.props.feed}/>
        }
        <div className="postAuthor">
          <img src={this.props.feed.iconUrl}/> 
          {this.props.feed.author}
          <div className="timeStamp">{this.props.feed.timeStamp} ago</div>
      </div>
        {this.props.feed.postText}
        <br/>
        { this.props.detailView ? null :
        <p onClick={this.handleClick} className="comentsLink"> {commentCount} {(commentCount>0 && commentCount<=1) ? "Comment" : "Comments"}</p>
      }
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
        <div>
        <input type="text" placeholder="Write a comment.." ref="text" className="textInput customButton"/>
        <input type="submit" className="customButton postButton" value="Post" disabled="true" ref="post"/>
        </div>
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
                userIcon: 'http://localhost:3000/images/man2.png',
                userName: 'Jhon Smith'
              };
React.render(
   <App/>,
  document.getElementById('content')
);