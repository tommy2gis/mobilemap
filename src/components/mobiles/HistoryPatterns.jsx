import React from "react";
import { connect } from "react-redux";
import { Timeline } from 'antd';
import ReactDOM from "react-dom";
import renwupng from "./assets/renwu.png";
import { withRouter } from "react-router-dom";
import { selectTask, queryTasks } from "../../actions/query";
import { changeModel } from "../../actions/map";

import { NavBar, ListView, Button, Toast, List } from "antd-mobile";

class HistoryPatterns extends React.Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2
    });

    this.state = {
      dataSource: dataSource,
      refreshing: false,
      height: document.documentElement.clientHeight,
      currentPage: 1,
      pageSize: 7,
      data: [],
      hasMore: true,
      isLoading: false
    };
  }

  componentDidMount() {
    this.renderResize();

    if (this.props.query.pattensresult) {
      this.initData = this.props.query.pattensresult.result;
      if (this.initData.length < this.state.pageSize) {
        this.setState({
          hasMore: false
        });
      }
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(this.initData)
      });
    }
    // Set the appropriate height
    setTimeout(
      () =>
        this.setState({
          height: this.state.height - 50 + "px"
        }),
      0
    );
  }

  renderResize = () => {
    var width = document.documentElement.clientWidth;
    var height = document.documentElement.clientHeight;
    if (width > height) {
      this.setState({
        height: height - 50 + "px"
      });
    } else {
      this.setState({
        height: height - 50 + "px"
      });
    }
  };

  componentWillMount() {
    window.addEventListener("resize", this.renderResize, false);
  }

  componentWillUnmount = () => {
    window.removeEventListener("resize", this.renderResize, false);
  };

  onScroll = e => {
    e;
  };

  getOutputList = () => {
    this.setState(
      { currentPage: this.state.currentPage + 1, isLoading: true },
      () => {
        this.props.queryTasks(this.state.currentPage, this.state.pageSize);
      }
    );
  };

  onEndReached = event => {
    if (this.state.isLoading) {
      return false;
    }
    if (!this.state.hasMore) {
      return false;
    }
    this.setState({ isLoading: true });
    setTimeout(() => {
      this.getOutputList();
    }, 1000);
  };

  // If you use redux, the data maybe at props, you need use `componentWillReceiveProps`
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.query.pattensresult.result !== this.props.query.pattensresult.result
    ) {
      this.initData=this.initData.concat(nextProps.query.pattensresult.result);
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(
          this.initData
        )
      });
      if (this.initData.length >= nextProps.query.pattensresult.count) {
        this.setState({
          hasMore: false,
          isLoading: false
        });
      }
    }
  }

  _onTaskClick = task => {
    this.props.history.push("/");
    this.props.selectTask(task);
    this.props.changeModel("taskdetail");
  };

  renderList() {
    const row = dataRow => {
      return (
        <Timeline.Item> 
        <div key={dataRow} style={{ padding: "10px 15px" }}>
          <div
            style={{
              lineHeight: "30px",
              color: "#888",
              fontSize: 18
            }}
          >
            
             <span className='datetime'>{dataRow.createDate}</span>
            <span onClick={()=>this._onTaskClick(obj)} className='title'>数据名称: {dataRow.name}</span>
          </div>
          <div className='detail' >
                <span>巡查员: </span>{dataRow.userName}
                <br/>
                <span>数据内容: </span>{dataRow.content}
          </div>
        </div>
        </Timeline.Item>
      );
    };
    return (
      <ListView
        ref={el => (this.lv = el)}
        dataSource={this.state.dataSource}
        renderRow={row}
        pageSize={this.state.pageSize}
        style={{
          height: this.state.height
        }}
        scrollerOptions={{ scrollbars: true }}
        onScroll={this.onScroll}
        scrollRenderAheadDistance={200}
        scrollEventThrottle={20}
        onEndReached={this.onEndReached}
        onEndReachedThreshold={20}
        renderFooter={() => (
          <p>
            {this.state.hasMore ? "正在加载更多的数据..." : "已经全部加载完毕"}
          </p>
        )}
      />
    );
  }

  render() {
    return (
      <div className=" container historycontainer">
        <NavBar
          mode="light"
          onLeftClick={() => this.props.history.push("/")}
          leftContent={
            <div>
              <a className="back-main"  ></a>
            </div>
          }
        >
          图斑历史巡查记录
        </NavBar>
        <Timeline>
        {this.renderList()}
        </Timeline>
        
      </div>
    );
  }
}

export default connect(
  state => {
    return { query: state.query };
  },
  {
    selectTask,
    changeModel,
    queryTasks
  }
)(withRouter(HistoryPatterns));
