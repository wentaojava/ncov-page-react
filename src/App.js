import React, {Component} from 'react';
import echarts from 'echarts';
import 'echarts/map/js/china';
import geoJson from 'echarts/map/json/china.json';
import {geoCoordMap} from "./geo";
import {Alert, Card, Layout, Spin} from 'antd';
import "antd/dist/antd.css";
import CountUp from 'react-countup';
import './global.less';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            deskDivWidth: document.body.clientWidth,
            deskHeight: document.body.clientHeight,
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleSize);
        fetch('/api/viewData/getDataToday', {
            method: 'GET',
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *client
            //body: JSON.stringify(data) // body data type must match "Content-Type" header
        }).then((response) => response.json())
            .then((result) => {
                if ('10000' === result.header.code) {
                    var data = result.body;
                    this.setState({
                        loading: false,
                        confirmedCount: data.confirmedCount,//确诊人数
                        currentConfirmedCount: data.currentConfirmedCount,//现存确诊人数
                        suspectedCount: data.suspectedCount,//疑似人数
                        deadCount: data.deadCount,//死亡人数
                        curedCount: data.curedCount,//治愈人数
                    });
                    this.initalECharts(data.areaDataList);
                } else {
                    alert(result.header.message);
                }
            })
            .catch((error) => {
                alert(error);
            });
    }

    componentWillUnmount() {
        // 移除监听事件
        window.removeEventListener('resize', this.handleSize);
    }

    // 自适应浏览器的高度
    handleSize = () => {
        this.setState({
            deskDivWidth: document.body.clientWidth,
            deskHeight: document.body.clientHeight,
        });
    }

    initalECharts(areaDataList) {
        var colors = [
            ["#1DE9B6", "#F46E36", "#04B9FF", "#5DBD32", "#FFC809", "#FB95D5", "#BDA29A", "#6E7074", "#546570", "#C4CCD3"],
            ["#37A2DA", "#67E0E3", "#32C5E9", "#9FE6B8", "#FFDB5C", "#FF9F7F", "#FB7293", "#E062AE", "#E690D1", "#E7BCF3", "#9D96F5", "#8378EA", "#8378EA"],
            ["#DD6B66", "#759AA0", "#E69D87", "#8DC1A9", "#EA7E53", "#EEDD78", "#73A373", "#73B9BC", "#7289AB", "#91CA8C", "#F49F42"],
        ];
        var mapData = [[]];
        for (var key in geoCoordMap) {
            mapData[0].push({
                "name": key,
                "value": 90
            });
        }
        echarts.registerMap('zhongguo', geoJson);
        var convertData = function (data) {
            var res = [];
            for (var i = 0; i < data.length; i++) {
                var geoCoord = geoCoordMap[data[i].name];
                if (geoCoord) {
                    res.push({
                        name: data[i].name,
                        value: geoCoord.concat(data[i].value)
                    });
                }
            }
            return res;
        };
        var showDataByProince = function (data) {
            for (var i = 0; i < areaDataList.length; i++) {
                var name = areaDataList[i].provinceShortName;
                if (data === name) {
                    return areaDataList[i].confirmedCount;
                }
            }
        };
        const optionXyMap01 = {
            timeline: {
                show: false
            },
            baseOption: {
                geo: {
                    map: 'china',
                    /*调整地图位置*/
                    center: [150, 35],
                    /*控制鼠标放上去是否显示省份*/
                    label: {
                        emphasis: {
                            show: false
                        }
                    },
                    itemStyle: {
                        normal: {
                            borderColor: 'rgba(147, 235, 248, 1)',
                            borderWidth: 1,
                            areaColor: {
                                type: 'radial',
                                x: 0.5,
                                y: 0.5,
                                r: 0.8,
                                colorStops: [{
                                    offset: 0,
                                    color: 'rgba(147, 235, 248, 0)' // 0% 处的颜色
                                }, {
                                    offset: 1,
                                    color: 'rgba(147, 235, 248, .2)' // 100% 处的颜色
                                }],
                                globalCoord: false // 缺省为 false
                            },
                            shadowColor: 'rgba(128, 217, 248, 1)',
                            // shadowColor: 'rgba(255, 255, 255, 1)',
                            shadowOffsetX: -2,
                            shadowOffsetY: 2,
                            shadowBlur: 10
                        },
                        emphasis: {
                            areaColor: '#389BB7',
                            borderWidth: 0
                        }
                    }
                },
            },
            options: []
        };
        optionXyMap01.options.push({
            backgroundColor: '#051b4a',
            title: [{
                id: 'statistic',
                text: "",
                top: '2%',
                textStyle: {
                    color: '#fff',
                    fontSize: 30
                }
            }],
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    return params.name + '<br/>' + '确诊人数： ' + showDataByProince(params.name);
                }
            },
            series: [
                //未知作用
                {
                    //文字和标志
                    name: 'light',
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    data: convertData(mapData[0]),

                },
                //地图？
                {
                    type: 'map',
                    map: 'china',
                    geoIndex: 0,
                    aspectScale: 1, //长宽比
                    showLegendSymbol: false, // 存在legend时显示
                    label: {
                        normal: {
                            show: false
                        },
                        emphasis: {
                            show: false,
                            textStyle: {
                                color: '#fff'
                            }
                        }
                    },
                    animation: false,
                    data: convertData(mapData[0])
                },
                //地图点的动画效果
                {
                    //  name: 'Top 5',
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    data: convertData(mapData[0]),
                    symbolSize: function (val) {
                        return val[2] / 10;
                    },
                    showEffectOn: 'render',
                    rippleEffect: {
                        brushType: 'stroke'
                    },
                    label: {
                        normal: {
                            formatter: '{b}',
                            position: 'right',
                            show: true
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: "#F46E36",
                            shadowBlur: 10,
                            shadowColor: "#F46E36"
                        }
                    }
                }


            ]
        });
        const myChart = echarts.init(document.getElementById('mainMap'));
        myChart.setOption(optionXyMap01);
    }

    render() {
        const {Header, Footer, Content} = Layout;
        return (
            <>
                {this.state.loading ? (
                    <div id='load'>
                        <Spin tip="Loading..." size="large" style={{width: '100vm', height: '100vh'}}>
                            <Alert
                                message="请求后端数据中"
                                description="服务器处理较慢，后期会优化"
                                type="info"
                                style={{width: '100vm', height: '100vh', textAlign: 'center'}}
                            />
                        </Spin></div>
                ) : (
                    <div className="chinaMap" style={{width: this.state.deskDivWidth, height: this.state.deskHeight}}>
                        <Layout style={{background: '#051b4a', height: this.state.deskHeight}}>
                            <Header style={{background: '#051b4a', height: 'auto'}}>
                                <div style={{marginBottom: '50px', background: '#051b4a'}}>
                                    <h1 style={{color: 'white', fontSize: 'xx-large'}}>今日全国疫情数据</h1>
                                    <Card bordered={false} headStyle={{background: '#051b4a'}}
                                          bodyStyle={{background: '#051b4a'}}>
                                        <Card.Grid style={{
                                            width: '15%',
                                            height: '100px',
                                            textAlign: 'center',
                                            marginLeft: '10px',
                                            background: '#051b4a'
                                        }}>
                                            <h2 style={{fontFamily: 'cursive', color: '#fff'}}> 确诊人数：
                                                <span style={{fontFamily: 'cursive', color: 'cornflowerblue'}}>
                                         <CountUp start={0} end={this.state.confirmedCount}/>人
                                        </span>
                                            </h2>
                                            <span style={{fontFamily: 'cursive', color: '#fff'}}>现存确诊人数：
                                                <CountUp start={0} end={this.state.currentConfirmedCount}/>人</span>
                                        </Card.Grid>
                                        <Card.Grid style={{
                                            width: '18%',
                                            height: '100px',
                                            textAlign: 'center',
                                            marginLeft: '5%',
                                            background: '#051b4a'
                                        }}>
                                            <h2 style={{fontFamily: 'cursive', color: '#fff'}}> 疑似人数：
                                                <span style={{fontFamily: 'cursive', color: 'aqua'}}>
                                         <CountUp start={0} end={this.state.suspectedCount}/>人
                                        </span>
                                            </h2>
                                            <span style={{
                                                fontFamily: 'cursive',
                                                color: '#fff'
                                            }}>python未爬取到该数据，后期想办法添加</span>
                                        </Card.Grid>
                                        <Card.Grid style={{
                                            width: '15%',
                                            height: '100px',
                                            textAlign: 'center',
                                            marginLeft: '5%',
                                            background: '#051b4a'
                                        }}>
                                            <h2 style={{fontFamily: 'cursive', color: '#fff'}}> 治愈人数：
                                                <span style={{fontFamily: 'cursive', color: 'green'}}>
                                         <CountUp start={0} end={this.state.curedCount}/>人
                                        </span>
                                            </h2>
                                        </Card.Grid>
                                        <Card.Grid style={{
                                            width: '15%',
                                            height: '100px',
                                            textAlign: 'center',
                                            marginLeft: '5%',
                                            background: '#051b4a'
                                        }}>
                                            <h2 style={{fontFamily: 'cursive', color: '#fff'}}> 死亡人数：
                                                <span style={{fontFamily: 'cursive', color: 'blueviolet'}}>
                                         <CountUp start={0} end={this.state.deadCount}/>人
                                        </span>
                                            </h2>
                                        </Card.Grid>
                                    </Card>
                                </div>
                            </Header>
                            <Content style={{background: '#051b4a'}}>
                                <div id="mainMap" style={{width: '100%', height: '100%'}}></div>
                            </Content>
                            <Footer style={{background: '#051b4a'}}>Footer</Footer>
                        </Layout>
                    </div>

                )}
            </>
        );
    }
}

export default App;
