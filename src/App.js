import React, {Component} from 'react';
import echarts from 'echarts';
import 'echarts/map/js/china';
import geoJson from 'echarts/map/json/china.json';
import {geoCoordMap} from "./geo";
import {Alert, Button, Col, Divider, Layout, Option, Row, Select, Spin, Table} from 'antd';
import "antd/dist/antd.css";
import CountUp from 'react-countup';
import './global.less';
import './App.css';


const dataSource = [];

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            deskDivWidth: document.body.clientWidth,
            deskHeight: document.body.clientHeight,
            hasData: false,
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleSize);
        /**
         *获取今日疫情数据
         */
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
                        areaDataList: data.areaDataList,//用于下拉框赋值
                    });
                    this.initalECharts(data.areaDataList);
                } else {
                    alert("获取今日疫情数据失败，错误信息=" + result.header.message);
                }
            })
            .catch((error) => {
                alert("获取今日疫情数据失败，错误信息=" + error);
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
    };

    /**
     *地图渲染
     */
    initalECharts(areaDataList) {

        var colors = ["#22e9b3", "#4233f4", "#ff4ff3", "#bd5d2b", "#ff3021"];
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

        /**
         *用于地图鼠标悬停的显示
         */
        var showDataByProince = function (data) {
            for (var i = 0; i < areaDataList.length; i++) {
                var name = areaDataList[i].provinceShortName;
                if (data === name) {
                    return areaDataList[i].confirmedCount;
                }
            }
        };

        /**
         *用于各省份地图点显示
         */
        var makeItemColor = function (data) {
            for (var i = 0; i < areaDataList.length; i++) {
                var name = areaDataList[i].provinceShortName;
                if (data === name) {
                    if (areaDataList[i].confirmedCount <= 99) {
                        return colors[0];
                    } else if (areaDataList[i].confirmedCount >= 100 && areaDataList[i].confirmedCount <= 499) {
                        return colors[1];
                    } else if (areaDataList[i].confirmedCount >= 500 && areaDataList[i].confirmedCount <= 999) {
                        return colors[2];
                    } else if (areaDataList[i].confirmedCount >= 1000 && areaDataList[i].confirmedCount <= 1999) {
                        return colors[3];
                    } else if (areaDataList[i].confirmedCount >= 20000) {
                        return colors[4];
                    }
                }
            }
        };
        const optionXyMap01 = {
            timeline: {
                show: false
            },
            baseOption: {
                visualMap: {
                    type: 'piecewise',
                    pieces: [{
                        min: 20000,
                        color: colors[4]
                    },
                        {
                            min: 1000,
                            max: 1999,
                            color: colors[3]
                        },
                        {
                            min: 500,
                            max: 999,
                            color: colors[2]
                        },
                        {
                            min: 100,
                            max: 499,
                            color: colors[1]
                        },
                        {
                            min: 0,
                            max: 99,
                            color: colors[0]
                        }
                    ],
                    orient: 'vertical',
                    itemWidth: 25,
                    itemHeight: 15,
                    showLabel: true,
                    seriesIndex: [0],
                    textStyle: {
                        color: '#7B93A7'
                    },
                    bottom: "20%",
                    right: "10%",
                },
                geo: {
                    map: 'china',
                    left: "150px",
                    /*调整地图位置*/
                    center: [90, 32],
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
            options: [{

                title: [{
                    id: 'statistic',
                    text: "疫情地图",
                    top: '2%',
                    left: '5%',
                    textStyle: {
                        color: 'blue',
                        fontSize: 30
                    }
                },
                    {
                        id: '',
                        text: "鼠标放置省份名称或区域可显示确诊人数",
                        left: '20%',
                        top: '3%',
                        textStyle: {
                            color: '#000',
                            fontSize: 10
                        }
                    }
                ],
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
                                color: function (params) {
                                    return makeItemColor(params.name);
                                },
                                shadowBlur: 10,
                                shadowColor: "#F46E36"
                            }
                        }
                    }


                ]
            }]
        };
        const myChart = echarts.init(document.getElementById('mainMap'));
        myChart.setOption(optionXyMap01);
        myChart.resize();
    }

    /**
     *查询按钮点击触发函数
     */
    showCityInfo() {
        this.setState({
            loadingTable: true,//表格加载标识
        });
        var data = {"header": {}, "body": {"id": this.state.selectedValue}};
        fetch('/api/viewData/getCityDataTodayByMongodbId', {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(data)
        }).then((response) => response.json())
            .then((result) => {
                if ('10000' === result.header.code) {
                    var data = result.body;
                    dataSource.length = 0;
                    for (var i = 0; i < data.length; i++) {
                        dataSource.push({
                            key: i,
                            cityName: data[i].cityName,
                            confirmedCount: data[i].confirmedCount,
                            suspectedCount: data[i].suspectedCount,
                            curedCount: data[i].curedCount,
                            deadCount: data[i].deadCount,
                        });//城市信息
                    }
                    this.setState({
                        hasData: true,
                        loadingTable: false,
                    });
                } else {
                    alert("获取对应省份的城市疫情信息失败，错误信息=" + result.header.message);
                }
            })
            .catch((error) => {
                alert("获取对应省份的城市疫情信息失败，错误信息=" + error);
            });
    }

    /**
     *下拉框选择触发函数
     */
    changeSelectedProince(value) {
        this.setState({
            selectedValue: value
        })
    }

    render() {
        const {Header, Footer, Content} = Layout;
        const columns = [
            {
                title: '地区',
                dataIndex: 'cityName',
                key: 'cityName',
                align: 'center',
            },
            {
                title: '确诊人数',
                dataIndex: 'confirmedCount',
                key: 'confirmedCount',
                align: 'center'
            },
            {
                title: '疑似人数(此数值未爬取成功)',
                dataIndex: 'suspectedCount',
                key: 'suspectedCount',
                align: 'center'
            },
            {
                title: '治愈人数',
                dataIndex: 'curedCount',
                key: 'curedCount',
                align: 'center'
            },
            {
                title: '死亡人数',
                dataIndex: 'deadCount',
                key: 'deadCount',
                align: 'center'
            },
        ];

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
                    <div>
                        <Layout style={{
                            width: this.state.deskDivWidth / 10 * 8,
                            height: '100%',
                            marginLeft: this.state.deskDivWidth / 10
                        }}>
                            <Header style={{height: this.state.deskHeight / 10}}>
                                <h1 style={{color: 'white', height: '100%', fontSize: 'xx-large'}}>
                                    今日全国疫情数据
                                </h1>
                            </Header>
                            <Content style={{marginTop: '20px'}}>
                                <span style={{
                                    marginLeft: '10%',
                                    fontSize: 'small',
                                    color: 'red'
                                }}>疑似人数数值，python没有爬取到，正在想办法获取</span>
                                <span style={{marginLeft: '10%', fontSize: 'small'}}>数据来源于丁香园，与支付宝数据可能会有出入</span>
                                <span style={{marginLeft: '10%', fontSize: 'small'}}>感谢张学兵（前端大佬）给与的技术支持;</span>
                                <Divider style={{color: '#fff'}}></Divider>
                                <div style={{height: 'auto', marginTop: '20px', marginLeft: '50px'}}>
                                    <Row>
                                        <Col span={6}> <Button size={"large"} type={"primary"} style={{
                                            height: '75px',
                                            marginLeft: '1%',
                                            marginTop: '1px',
                                            textAlign: 'left'
                                        }}>
                                            <h2 style={{fontFamily: 'cursive', color: '#fff'}}> 确诊人数：
                                                <span style={{fontFamily: 'cursive', color: 'brown'}}>
                                         <CountUp start={0} end={this.state.confirmedCount}/> </span>
                                            </h2>
                                            <span style={{fontFamily: 'cursive', color: '#fff'}}>现存确诊人数：
                                            <span style={{fontFamily: 'cursive', color: 'brown'}}>
                                            <CountUp start={0} end={this.state.currentConfirmedCount}/> </span>
                                        </span>
                                        </Button>
                                        </Col>
                                        <Col span={6}><Button size={"large"} type={"primary"} style={{
                                            height: '75px',
                                            marginLeft: '1%',
                                            marginTop: '1px',
                                            textAlign: 'left'
                                        }}>
                                            <h2 style={{fontFamily: 'cursive', color: '#fff'}}> 疑似人数：
                                                <span style={{fontFamily: 'cursive', color: 'brown'}}>
                                         <CountUp start={0} end={this.state.suspectedCount}/> </span>
                                            </h2>
                                        </Button>
                                        </Col>
                                        <Col span={6}> <Button size={"large"} type={"primary"} style={{
                                            height: '75px',
                                            marginLeft: '1%',
                                            marginTop: '1px',
                                            textAlign: 'left'
                                        }}>
                                            <h2 style={{fontFamily: 'cursive', color: '#fff'}}> 治愈人数：
                                                <span style={{fontFamily: 'cursive', color: 'green'}}>
                                         <CountUp start={0} end={this.state.curedCount}/> </span>
                                            </h2>
                                        </Button>
                                        </Col>
                                        <Col span={6}><Button size={"large"} type={"primary"} style={{
                                            height: '75px',
                                            marginLeft: '1%',
                                            marginTop: '1px',
                                            textAlign: 'left'
                                        }}>
                                            <h2 style={{fontFamily: 'cursive', color: '#fff'}}> 死亡人数：
                                                <span style={{fontFamily: 'cursive', color: 'black'}}>
                                         <CountUp start={0} end={this.state.deadCount}/> </span>
                                            </h2>
                                        </Button>
                                        </Col>
                                    </Row>
                                </div>
                                <Divider style={{color: '#fff'}}></Divider>
                                <div id="mainMap" style={{width: '100vm', height: '70vh', marginTop: '20px'}}></div>
                                <Divider style={{color: '#fff'}}></Divider>
                                <div>
                                    <Alert message="选择省份或直接输入，点击查询，查看有疫情数据的相关城市或地区" type="info"
                                           style={{marginLeft: '10px', marginRight: '10px'}}/>
                                    <Select
                                        style={{width: 250, marginLeft: '10px', marginTop: '10px'}}
                                        placeholder="Select or input a province"
                                        optionFilterProp="children"
                                        onChange={this.changeSelectedProince.bind(this)}
                                        /* onFocus={}
                                        onBlur={}
                                        onSearch={}*/
                                        showSearch={true}
                                    >
                                        {this.state.areaDataList.map(province => (
                                            <Select.Option key={province.locationId} value={province.id}>
                                                {province.provinceShortName}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                    <Button type="primary" style={{marginLeft: '10px'}}
                                            onClick={this.showCityInfo.bind(this)}>查询</Button>
                                </div>
                                <div style={{marginTop: '10px', marginLeft: '10px', marginRight: '10px'}}>
                                    <Table dataSource={this.state.hasData ? dataSource : null}
                                           columns={columns} bordered={true} locale={{emptyText: "暂无数据"}}
                                           pagination={{size: 'small'}} loading={this.state.loadingTable}/>
                                </div>
                            </Content>
                            <Divider style={{color: '#fff'}}></Divider>
                            <Footer style={{marginTop: '20px', textAlign: 'center'}}>
                                @made by wentao
                            </Footer>
                        </Layout>
                    </div>

                )}
            </>
        );
    }
}

export default App;
