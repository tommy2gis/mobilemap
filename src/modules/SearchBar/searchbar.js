/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:29:54 
 * @Last Modified by: 史涛
 * @Last Modified time: 2020-05-07 09:46:02
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Card, Input, AutoComplete, Tooltip,Icon } from 'antd';
import { query, resetQuery, queryOnFocus, changeQueryKey, clearSimpleResult,simpleQuery } from '../../actions/query';
import PropTypes from 'prop-types';
import ResultList from './list';
import './searchbar.less'

const Option = AutoComplete.Option;

class SearchBar extends Component {
    static propTypes = {
        onQuery: PropTypes.func,
        resetQuery: PropTypes.func,
        queryOnFocus: PropTypes.func,
        changeQueryKey: PropTypes.func,
        query: PropTypes.object
    };
    static defaultProps = {
        onQuery: () => { },
        resetQuery: () => { },
        queryOnFocus: () => { },
    };

    state = {
        result: [],
        text: this.props.query.key || ''
    }

    /**
     *
     *
     * @param {*} value
     */
    handleSearch = (value) => {
        this.props.simpleQuery(value);
    }

    InputOnBlur = (e) => {
        //this.props.queryOnFocus(false)
    };

    /**
     *
     *
     * @param {*} e
     */
    handleSubmit = e => {
        const text = e.trim()
        if (text.length > 0 && e.which === 13) {
            this.props.onQuery()
        }
    }

    /**
     *
     *
     * @param {*} e
     */
    handleSelect = e => {
        const text = e.trim().split(',')[0];
        this.props.onQuery(text)
    }

    /**
     *
     *
     * @param {*} e
     */
    handleChange = e => {
        let text = e ? e.trim().split(',')[0] : '';
        this.props.changeQueryKey(text, 'name');
    }

    clearKeys= () => {
        this.props.clearSimpleResult();
    }

    


    render() {

        const {result,simpleresult,nearbytitle}=this.props.query;
        function renderOption(item) {
            return <Option key={item.id} value={item.name+','+item.id}><Icon type="search" /> {item.name}{<span className="search-item-class">{item.address}</span>}</Option>;
          }

        return (
            <div >
                <Card className="searchbar_card" bordered={false} >
                    <Input.Group>
                       {nearbytitle&&<div id="nearby-searchbox-hint">在<span id="nearby-searchbox-hint-center" title={nearbytitle}>{nearbytitle}</span>附近搜索</div>}
                        <AutoComplete className={nearbytitle?'search_nearby':'search_auto'}
                            placeholder="请输入关键字"
                            dropdownClassName="search_auto_dropdown"
                            onFocus={() => this.props.queryOnFocus(true)}
                            onSearch={this.handleSearch}
                            onKeyDown={this.handleSubmit}
                            onChange={this.handleChange}
                            onSelect={this.handleSelect}
                            value={this.props.query.key}
                            dataSource={simpleresult.map(renderOption)}
                        >
                            {/* {children} */}
                        </AutoComplete>



                        {result ?
                            <Tooltip placement="bottom" title={'清空'}>
                                <i className="iconfont icon-clear searchbar_button"
                                    onClick={() => this.props.resetQuery()} >
                                </i>
                            </Tooltip>
                            :  this.props.model3d === "leaflet"?<Tooltip placement="bottom" title={'线路'}>
                            <i className="iconfont icon-luxian searchbar_button"
                                 >
                            </i>
                        </Tooltip>:null}

                        <Tooltip placement="bottom" title={'查询'}>
                            <i className="iconfont icon-search searchbar_button querybtn" onClick={() => this.props.onQuery()} ></i>
                        </Tooltip>

                    </Input.Group>


                </Card>
                {result?<ResultList></ResultList>:null}
                
            </div>
        );
    }
}

export default connect((state) => {
    return { query: state.query }
}, { onQuery: query, simpleQuery, resetQuery, queryOnFocus, changeQueryKey, clearSimpleResult })(SearchBar);

