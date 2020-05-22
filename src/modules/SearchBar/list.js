/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:29:16 
 * @Last Modified by: 史涛
 * @Last Modified time: 2020-05-22 11:51:27
 */
import React, { Component } from 'react';
import { List, Avatar, Icon } from 'antd';
import { connect } from 'react-redux';
import { changeQueryPageIndex,onHoverResult,onClickResult} from '../../actions/query';
import {
    changeModel
  } from "../../actions/map";
export class ResultList extends Component {

    listTouchSatrt=(e)=>{//触摸
        e.preventDefault();
        let touch=e.touches[0];
        this.startY = touch.pageY;   //刚触摸时的坐标              
    }
    listTouchMove=(e)=>{
        e.preventDefault();        
        let  touch = e.touches[0];               
        this.touchmovey= touch.pageY - this.startY;//滑动的距离
    }
    listScroll=(e)=>{
        // this.dom = document.getElementsByClassName("queryresult_containtcard")[0];
        // console.log(this.dom.scrollTop)       
    }

    listTouchEnd=(e)=>{
        this.dom = document.getElementsByClassName("ant-spin-nested-loading")[0];
        this.list = document.getElementsByClassName("query_resultlist")[0];
        if(this.dom.scrollTop==0&&this.touchmovey>100){
            this.list.style.display="none";
            this.props.changeModel("searchhidemodel");
        }
        this.touchmovey=0;
    }
    showList=()=>{
        this.list = document.getElementsByClassName("query_resultlist")[0];
        this.list.style.display="block";
        this.props.changeModel("main");
    }
    render() {
        const {result,resultcount,responsetime}=this.props.query;
        const listData = [];
        if (!result) {
            return <div />;
        }
        result.forEach(item => {
            listData.push({
                title: item.name,
                midbclass:item.duplicate?('('+item.midbclass+')'):'',
                id:item.hotPointID,
                address: item.address||'暂无',
                telephone:item.phone||'暂无',
            });
        });

        return (
            <div  className="queryresult_containtcard"  onScroll={this.listScroll} onTouchStart={this.listTouchSatrt} onTouchMove={this.listTouchMove} onTouchEnd={this.listTouchEnd}>
                <List  ref="query_resultlist"
                    itemLayout="vertical"
                    size="large"
                    locale={{emptyText:(<div className="no-data-text">
                    <p>未找到相关地点。</p>
                    <p>您还可以：</p>						
                    <ul>
                        <li>检查输入是否正确或者输入其它词</li>
                        <li>使用分类进行查找</li>
                        <li>使用纠错功能对存在的问题进行上报</li>
                    </ul>
                    </div>)}}
                    className="query_resultlist"
                    pagination={{
                        onChange: (page) => {
                            this.props.changeQueryPageIndex(page);
                            
                        },
                        total: resultcount,
                        pageSize: 10, size: "small"
                    }}
                    dataSource={listData}
                    renderItem={(item,index) => (
                        <List.Item onClick={()=>this.props.onClickResult(item.id)} onMouseOver ={()=>this.props.onHoverResult(item.id)}  onMouseOut={()=>this.props.onHoverResult(null)} 
                            key={item.id}>
                            <List.Item.Meta
                                title={<div><a ><span className="extra-marker" >{index+1}</span>{item.title}</a><span style={{fontSize:'small'}}>{item.midbclass}</span></div>}
                                description={<div><p >{'地址:'+item.address}</p><p>{'电话:'+item.telephone}</p></div>}
                            />
                           {/*  {item.content} */}
                        </List.Item>
                    )}
                />
                <span className="resultcount_span" onClick={this.showList}>共找到相关{resultcount}个结果</span>
            </div>
        )
    }
};

export default connect((state) => {
    return { query: state.query }
}, { changeQueryPageIndex,onHoverResult,onClickResult,changeModel})(ResultList);


