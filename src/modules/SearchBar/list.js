/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:29:16 
 * @Last Modified by: 史涛
 * @Last Modified time: 2020-05-07 09:46:32
 */
import React, { Component } from 'react';
import { List, Avatar, Icon } from 'antd';
import { connect } from 'react-redux';
import { changeQueryPageIndex,onHoverResult,onClickResult} from '../../actions/query';

export class ResultList extends Component {

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
            <div className="queryresult_containtcard">
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
                <span className="resultcount_span">共找到{resultcount}个结果 耗时{responsetime}</span>
            </div>
        )
    }
};

export default connect((state) => {
    return { query: state.query }
}, { changeQueryPageIndex,onHoverResult,onClickResult})(ResultList);


