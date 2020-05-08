/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:29:37 
 * @Last Modified by: 史涛
 * @Last Modified time: 2020-05-08 17:04:33
 */
import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Tabs, Row, Radio, Alert, Collapse, AutoComplete, Spin, List, Timeline, Col, Divider, Avatar, Input, Icon, Button } from 'antd';
import PropTypes from 'prop-types';
import {
    changeRoutingStyle,
    selectBusLine,
    deleteMidLoc,
    changeBusRoutingStyle,
    poiQuery,
    resetRouting,
    changeGetPosiModel,
    switchOrigDest,
    setBeginLoc,
    loadRouting,
    setBeginAddress,
    setEndAddress,
    setEndLoc, changeModule
} from './actions';
import './routing.css';



export class Routing extends Component {
    static propTypes = {
        changeRoutingType: PropTypes.func,
        switchOrigDest: PropTypes.func
    };
    state = {
        currentinput: 'car-begin',
        beginaddress: '',
        endaddress: '',
        showbegionsel: false,
        showendsel: false,
        showdetail:false,
        posimodel:null,
    }

    clearAddress = () => {
        this.setState({
            beginaddress: '',
            endaddress: '',
            showbegionsel: false,
            showendsel: false
        })
    }


    handleModuleChange = (key) => {
        this.props.changeModule(key);
    }


    handleTypeChange = (e) => {
        this.props.changeRoutingStyle(e.target.value);
    }

    handleBusTypeChange = (e) => {
        this.props.changeBusRoutingStyle(e.target.value);
    }

    handleBusCollapseChange = (key) => {
        this.props.selectBusLine(key);
    }

    handleDeleteMid = (id) => {
        this.props.deleteMidLoc(id);
    }


    /**
     *
     *
     * @returns
     */
    renderSimpleList = () => {
        if (this.props.routing.moduletype === 'routing-car') {
            return this.props.routing.result.simple && this.props.routing.result.simple.map((currentItem, index) => {
                return <Collapse.Panel showArrow={false} header={(index + 1) + '.' + currentItem.strguide} key={currentItem.segmentNumber}>

                    <Timeline className="routing_detailist">
                        {this.renderCarDetailList(currentItem.segmentNumber)}

                    </Timeline>


                </Collapse.Panel>
            })
        } else {
            let results = this.props.routing.result.results;
            if (results && results.length > 0) {
                return results[0].lines && results[0].lines.map((currentItem, index) => {
                    var lines = currentItem.lineName.split('|');
                    lines.pop();
                    let des = lines.length > 1 ? '换乘' + (lines.length - 1) + '次' : '无需换乘';
                    return <Collapse.Panel showArrow={false} header={<div><span >{lines.join('>')}</span><br /><span style={{ color: '#999' }}>{des}</span></div>} key={index}>


                        <Timeline className="routing_detailist">
                            {this.renderBusDetailList(currentItem.segments)}

                        </Timeline>

                    </Collapse.Panel>
                })
            }

        }

    }

    /**
     *
     *
     * @param {*} datas
     * @returns
     */
    renderBusDetailList = (datas) => {
        return datas.map((item, index) => {
            if (item.segmentType == 1) {
                return (<Timeline.Item key={index}><span >{item.stationStart.name || '起点'}</span>{'步行至'}<span>{item.stationEnd.name || '目的地'}</span></Timeline.Item>);
            } else if (item.segmentType == 2) {
                let start = '';
                if (item.segmentLine.length > 0) {
                    start = item.segmentLine[0].lineName;
                } else {
                    start = item.segmentLine[0].lineName;
                }
                return (<Timeline.Item key={index}>{'乘坐'}<span> {start}</span>  {'公交在'}<span> {item.stationEnd.name}</span> {'下车'}</Timeline.Item>);
            } else if (item.segmentType == 3) {
                let start = '';
                if (item.segmentLine.length > 0) {
                    start = item.segmentLine[0].lineName;
                } else {
                    start = item.segmentLine[0].lineName;
                }
                return (<Timeline.Item key={index}>{'乘坐'}<span> {start}</span>  {'在'}<span> {item.stationEnd.name}</span> {'出地铁'}</Timeline.Item>);
            }




        })
    }

    /**
     *
     *
     * @returns
     */
    renderMidPosition = () => {
        return this.props.routing.midlocs.map(loc => {
            return <span key={loc.id} className="midpointinput ant-input-affix-wrapper ant-input-affix-wrapper-lg">
                <span className="ant-input-prefix">
                    <i className="anticon anticon-environment-o yellow-6" ></i></span>
                <input defaultValue='自定义途径点' readonly="readonly" type="text" className="ant-input-lg" />

                <span className="ant-input-suffix"><Icon onClick={() => this.handleDeleteMid(loc.id)} type="close" theme="outlined" /></span>

            </span>
        })
    }

    /**
     *
     *
     * @param {*} segnum
     * @returns
     */
    renderCarDetailList = (segnum) => {
        let step = segnum.split('-');
        return this.props.routing.result.routes.map((item, index) => {
            if (step.length == 1) {
                if (index == Number(step[0])) {

                    return (<Timeline.Item key={index}>{item.strguide}</Timeline.Item>);
                }
            } else {
                if (index >= step[0] && index <= step[1]) {
                    return (<Timeline.Item key={index}>{item.strguide}</Timeline.Item>);
                }
            }

        })
    }


    /**
     *
     *
     * @param {*} value
     * @param {*} model
     */
    handlePOISearch = (value, model) => {
        const text = value.trim();
        if (text) {
            this.setState({ currentinput: model })
            this.props.poiQuery(text, model);
        }

    }


    /**
     *
     *
     * @param {*} e
     * @param {*} model
     */
    handlePOISelect = (e, model) => {
        const text = e.trim().split(',');

        switch (this.state.currentinput) {
            case 'car-begin':
            case 'bus-begin':
                this.setBegionLoc(text);
                break;
            case 'car-end':
            case 'bus-end':
                this.setEndLoc(text);
                break;
            default:
                break;
        }
    }





    /**
     *
     *
     * @param {*} e
     * @param {*} model
     */
    handleBeginChange = (e, model) => {

        let text = e ? e.trim().split(',') : '';
        this.props.setBeginAddress(text[2] ? text[2] : text, text[2] ? 'poi' : 'custom');
        this.setState({ beginaddress: text[2] ? text[2] : text })
    }

    checkLocation = () => {
        if (this.state.beginaddress.length > 0 && this.props.routing.begintype === 'custom') {
            this.setState({ showbegionsel: true });
        }else{
            this.setState({ showbegionsel: false });
        }
        if (this.state.endaddress.length > 0 && this.props.routing.endtype === 'custom') {
            this.setState({ showendsel: true });
        }else{
            this.setState({ showbegionsel: false });
        }
        this.props.loadRouting();
    }

    beginGetLocation=()=>{
        this.state.posimodel&&this.props.changeGetPosiModel(this.state.posimodel);
    }

    beginFocus=()=>{
        this.setState({posimodel:'起'})
    }

    endFocus=()=>{
        this.setState({posimodel:'终'})
    }
    

    /**
     *
     *
     * @param {*} e
     * @param {*} model
     */
    handleEndChange = (e, model) => {
        let text = e ? e.trim().split(',') : '';
        this.props.setEndAddress(text[2] ? text[2] : text, text[2] ? 'poi' : 'custom');
        this.setState({ endaddress: text[2] ? text[2] : text })
    }

    /**
     *
     *
     */
    handleSwitchOrigDest = () => {
        let beginaddress = this.props.routing.beginaddress;
        this.props.setBeginAddress(this.props.routing.endaddress, 'poi');
        this.props.setEndAddress(beginaddress, 'poi');
        this.props.switchOrigDest();

    }



    setEndLoc(text) {
        this.props.setEndLoc('input', {
            lat: Number(text[1]),
            lng: Number(text[0])
        });
        this.props.setEndAddress(text[2], 'poi');
        this.setState({ endaddress: text[2], showendsel: false});
    }

    setBegionLoc(text) {
        this.props.setBeginLoc('input', {
            lat: Number(text[1]),
            lng: Number(text[0])
        });
        this.props.setBeginAddress(text[2], 'poi');
        this.setState({ beginaddress: text[2], showbegionsel: false});
    }

    render() {
        const {style,busstyle,poiresult} = this.props.routing;
        const {showdetail,currentinput}=this.state;
        const dataSource = poiresult && poiresult.map((item, index) => {
            return <AutoComplete.Option key={item.id + index} value={item.x + ',' + item.y + ',' + item.name}>{item.name}</AutoComplete.Option>;
        });
        let carbegindata, carenddata, busbegindata, busenddata;

        switch (currentinput) {
            case 'car-begin':
                carbegindata = dataSource;

                break;
            case 'car-end':
                carenddata = dataSource;


                break;
            case 'bus-begin':
                busbegindata = dataSource;

                break;
            case 'bus-end':
                busenddata = dataSource;

                break;
            default:
                break;
        }

        // const listItems = 
        return (
            <div className="routing_panel">
                <Tabs defaultActiveKey="routing-car" animated={false} onChange={this.handleModuleChange}>
                    <Tabs.TabPane tab="驾车" key="routing-car"><Row>
                        <Col span={18} push={4} >

                            <AutoComplete
                                placeholder="输入起点或地图选点"
                                allowClear={true}
                                dataSource={carbegindata}
                                onFocus={this.beginFocus}
                                onSearch={(value, model) => this.handlePOISearch(value, 'car-begin')}
                                onChange={this.handleBeginChange}
                                onSelect={this.handlePOISelect}
                                value={this.props.routing.begintype === 'poi' ? this.props.routing.beginaddress : this.state.beginaddress}
                            >
                                <Input suffix={<Icon type="environment-o" style={{ color: 'rgb(4, 150, 10)' }} />} ></Input>
                            </AutoComplete>
                            {this.renderMidPosition()}
                            <AutoComplete
                                placeholder="输入终点或地图选点"
                                allowClear={true}
                                dataSource={carenddata}
                                onFocus={this.endFocus}
                                onSearch={(value, model) => this.handlePOISearch(value, 'car-end')}
                                onChange={this.handleEndChange}
                                onSelect={this.handlePOISelect}
                                value={this.props.routing.endtype === 'poi' ? this.props.routing.endaddress : this.state.endaddress}
                            >
                                <Input suffix={<Icon type="environment-o" style={{ color: 'rgb(212, 3, 3)' }} />} />
                            </AutoComplete>

                        </Col>
                        <Col span={4} pull={18} className="routing_leftlogo"><span><a onClick={() => this.handleSwitchOrigDest()} className="iconfont icon-tiaohuan"></a></span></Col>
                    </Row>

                        <Row style={{ marginTop: '10px' }}>
                            <Col span={10} push={2}>
                                <Button onClick={this.beginGetLocation} >地图选点</Button>
                            </Col>
                            <Col span={6} push={2}>
                                <Button onClick={() => { this.props.resetRouting(); this.clearAddress() }}  >清除</Button>
                            </Col>
                            <Col span={6} push={2}>
                                <Button onClick={() => this.checkLocation()}  >开车去</Button>
                            </Col>
                        </Row>


                    </Tabs.TabPane>
                    <Tabs.TabPane tab="公交" key="routing-bus"><Row>
                        <Col span={18} push={4} >
                            <AutoComplete
                                placeholder="输入起点或地图选点"
                                allowClear={true}
                                dataSource={busbegindata}
                                onFocus={this.beginFocus}
                                onSearch={(value, model) => this.handlePOISearch(value, 'bus-begin')}
                                onChange={this.handleBeginChange}
                                onSelect={this.handlePOISelect}
                                value={this.props.routing.begintype === 'poi' ? this.props.routing.beginaddress : this.state.beginaddress}
                            >
                                <Input suffix={<Icon type="environment-o" style={{ color: 'rgb(4, 150, 10)' }} />} />
                            </AutoComplete>

                            <AutoComplete
                                placeholder="输入终点或地图选点"
                                allowClear={true}
                                dataSource={busenddata}
                                onFocus={this.endFocus}
                                onSearch={(value, model) => this.handlePOISearch(value, 'bus-end')}
                                onChange={this.handleEndChange}
                                onSelect={this.handlePOISelect}
                                value={this.props.routing.endtype === 'poi' ? this.props.routing.endaddress : this.state.endaddress}
                            >
                                <Input suffix={<Icon type="environment-o" style={{ color: 'rgb(212, 3, 3)' }} />} />
                            </AutoComplete>
                        </Col>
                        <Col span={4} pull={18} className="routing_leftlogo">
                            <span>
                                <a onClick={() => this.handleSwitchOrigDest()} className="iconfont icon-tiaohuan"></a>
                            </span></Col>
                    </Row>
                        <Row style={{ marginTop: '10px' }}>
                        <Col span={10} push={2}>
                                <Button onClick={this.beginGetLocation} >地图选点</Button>
                            </Col>
                            <Col span={6} push={2}>
                                <Button onClick={() => { this.props.resetRouting(); this.clearAddress() }}>清除</Button>

                            </Col>
                            <Col span={6} push={2}>
                                <Button onClick={() => this.checkLocation()}  >坐公交</Button>
                            </Col>

                        </Row>
                    </Tabs.TabPane>
                </Tabs>
                <div className={(this.state.showbegionsel || this.state.showendsel) ? "routing_locationpanel" : "routing_locationpanel hidden"}>
                    <Divider>请选择正确的起点或终点</Divider>
                    <Collapse accordion bordered={false} defaultActiveKey={['1']}>
                        {this.state.showbegionsel &&
                            <Collapse.Panel header={<div><Icon type="question-circle" />{" 起点: " + this.state.beginaddress}</div>} key="1">
                                <List
                                    itemLayout="horizontal"
                                    dataSource={this.props.routing.begionpoiresult}
                                    renderItem={(item, index) => (
                                        <List.Item onClick={()=>{this.setBegionLoc([item.lonlat.split(" ")[0],item.lonlat.split(" ")[1],item.name])}} actions={[<a><Icon type="environment" /></a>]}>
                                            <List.Item.Meta
                                                avatar={<Avatar>{index + 1}</Avatar>}
                                                title={item.name}
                                                description={item.address}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Collapse.Panel>}
                        {this.state.showendsel &&
                            <Collapse.Panel header={<div><Icon type="question-circle" />{" 终点: " + this.state.endaddress}</div>} key="2">
                                <List
                                    itemLayout="horizontal"
                                    dataSource={this.props.routing.endpoiresult}
                                    renderItem={(item, index) => (
                                        <List.Item  onClick={()=>{this.setEndLoc([item.lonlat.split(" ")[0],item.lonlat.split(" ")[1],item.name])}} actions={[<a><Icon type="environment" /></a>]}>
                                            <List.Item.Meta
                                                avatar={<Avatar>{index + 1}</Avatar>}
                                                title={item.name}
                                                description={item.address}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Collapse.Panel>}

                    </Collapse>
                </div>
                <div className={this.props.routing.result&&!this.state.showbegionsel&&!this.state.showendsel ? "routing_resultpanel" : "routing_resultpanel hidden"} >
                    {this.props.routing.moduletype == 'routing-car' ? (<Radio.Group style={{width:'100%'}} value={style} onChange={this.handleTypeChange}>
                        <Radio.Button value="0">最快线路</Radio.Button>
                        <Radio.Button value="1">最短线路</Radio.Button>
                        <Radio.Button value="2">少走高速</Radio.Button>
                    </Radio.Group>) : (<Radio.Group style={{width:'100%'}} value={busstyle} onChange={this.handleBusTypeChange}>
                        <Radio.Button value="1">较快捷</Radio.Button>
                        <Radio.Button value="8">不坐地铁</Radio.Button>
                        <Radio.Button value="2">少换乘</Radio.Button>
                        <Radio.Button value="4">少步行</Radio.Button>
                    </Radio.Group>)

                    }
                    {this.props.routing.result.distance ? ([<Alert style={{width:"calc(100vw - 170px)",float:"left"}} message={'总里程:约' + this.props.routing.result.distance + '公里'} type="info"></Alert>,<Button onClick={()=>{this.setState({showdetail:!this.state.showdetail})}} style={{margin:8,float:"right"}} >显示线路详情</Button>]) : (null)}

                    {this.props.routing.moduletype == 'routing-car' ? (<Collapse className={showdetail?'':"hidden"} bordered={false} accordion >{
                        this.renderSimpleList()
                    }</Collapse>) : (<Collapse bordered={false} className={showdetail?'':"hidden"} accordion activeKey={this.props.routing.busline} onChange={this.handleBusCollapseChange}>{
                        this.renderSimpleList()
                    }</Collapse>)

                    }

                </div>
                {
                this.props.routing.loading?<Spin size="large" />:null
                }
                

            </div>
        )
    }
}


export default connect((state) => {
    return { routing: state.routing }
}, {
        changeRoutingStyle,
        selectBusLine,
        deleteMidLoc,
        changeBusRoutingStyle,
        resetRouting,
        setBeginAddress,
        setEndAddress,
        poiQuery,
        loadRouting,
        switchOrigDest,
        changeGetPosiModel,
        setBeginLoc,
        setEndLoc,
        changeModule
    })(Routing);
