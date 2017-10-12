import React, {Component} from 'react';
import ReactDOM from 'react-dom'
import './styles/App.css';

let imageDatas = require('./data/imageData.json')


// 利用自执行函数， 将图片名信息转成图片URL路径信息
imageDatas = (function genImageURL(imageDatasArr) {
    for (let i = 0, j = imageDatasArr.length; i < j; i++) {
        let singleImageData = imageDatasArr[i];

        singleImageData.imageURL = require('./images/' + singleImageData.fileName);

        imageDatasArr[i] = singleImageData;
    }

    return imageDatasArr;
})(imageDatas);

function getRangeRandom(low, high) {
    // return Math.ceil(Math.random() * (high - low) + low)
    let temp = Math.ceil(Math.random() * (high - low) + low)
    return temp
}

/*
 * 获取 0~30° 之间的一个任意正负值
 */
function get30DegRandom() {
    return ((Math.random() > 0.5 ? '' : '-') + Math.ceil(Math.random() * 30));
}

class ImgFigure extends Component {

    //imgFigure 的点击处理函数

    handleClick = (e) => {
        if (this.props.arrange.isCenter) {
            this.props.inverse()
        } else {
            this.props.center()
        }

        e.stopPropagation();
        e.preventDefault();
    }

    render() {
        let styleObj = {};
        //如果props指定了图片的位置,就使用
        if (this.props.arrange.pos) {
            styleObj = {...this.props.arrange.pos}
        }

        //如果图片的旋转角度有值并且不为0,添加旋转角度
        if (this.props.arrange.rotate) {
            (['MozTransform', 'msTransform', 'WebkitTransform', 'transform']).forEach(function (value) {
                styleObj[value] = `rotate(${this.props.arrange.rotate}deg)`;
            }.bind(this));
        }

        //居中图片的z-index设置为11

        if (this.props.arrange.isCenter) {
            styleObj.boxShadow="rgba(0, 0, 0, 0.2) 2px 5px 6px 7px"
            styleObj.zIndex = 11;
        }

        let imgFigureClassName = "img-figure";
        imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse' : '';

        return (
            <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
                <img src={this.props.data.imageURL} alt={this.props.data.title}/>
                <figcaption>
                    <h2 className="img-title">{this.props.data.title}</h2>
                    <div className="img-back" onClick={this.handleClick}>
                        <p>
                            {this.props.data.desc}
                        </p>
                    </div>
                </figcaption>
            </figure>
        )
    }
}

class ControllerUnit extends Component {


    handleClick = (e) => {

        //如果点击的是当前正在选中态的按钮,则翻转图片,否则居中对应的图片
        if (this.props.arrange.isCenter) {
            this.props.inverse()
        } else {
            this.props.center()
        }

        e.preventDefault();
        e.stopPropagation();
    }

    render() {
        let controllerUnitClassName = "controller-unit";

        if (this.props.arrange.isCenter) {
            controllerUnitClassName += " is-center";

            // 如果同时对应的是翻转图片， 显示控制按钮的翻转态
            if (this.props.arrange.isInverse) {
                controllerUnitClassName += " is-inverse";
            }

        }

        return (
            <span className={controllerUnitClassName} onClick={this.handleClick}/>
        )
    }
}

class App extends Component {
    constructor(props) {
        super(props)

        // console.log("imageDatas:",imageDatas);
        let imgsArrangeArr = imageDatas.map((value,index) => {
            return {
            pos: {
                left: 0,
                top: 0
            },
            rotate: 0,
            isInverse: false,
            isCenter: false
        }})

        this.state = {
            imgsArrangeArr:imgsArrangeArr
        }

        // console.log("this.state.imgsArrangeArr:",this.state.imgsArrangeArr.length,this.state.imgsArrangeArr)
    }

    Constant = {
        centerPos: {
            left: 0,
            right: 0
        },
        hPosRange: {    //水平方向取值范围
            leftSecX: [0, 0],
            rightSecX: [0, 0],
            y: [0, 0]
        },
        vPosRange: {    //垂直方向取值范围
            x: [0, 0],
            topY: [0, 0]
        }
    }

    rearrange = (centerIndex) => {

        let imgsArrangeArr = this.state.imgsArrangeArr,
            Constant = this.Constant,
            centerPos = Constant.centerPos,
            hPosRange = Constant.hPosRange,
            vPosRange = Constant.vPosRange,
            hPosRangeLeftSecX = hPosRange.leftSecX,
            hPosRangeRightSecX = hPosRange.rightSecX,
            hPosRangeY = hPosRange.y,
            vPosRangeTopY = vPosRange.topY,
            vPosRangeX = vPosRange.x,

            imgsArrangeTopArr = [],

            //取一个或者不取
            topImgNum = Math.floor(Math.random() * 2),
            topImgSpliceIndex = 0,

            imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex, 1);
        // console.log("imgsArrangeCenterArr:", imgsArrangeCenterArr);

        //居中 centerIndex 的图片,居中的不旋转
        imgsArrangeCenterArr[0] = {
            pos: centerPos,
            rotate: 0,
            isCenter: true
        }

        //取出布局上侧的图片的状态信息
        topImgSpliceIndex = Math.ceil(Math.random() * (imgsArrangeArr.length - topImgNum));
        imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex, topImgNum);

        //布局位与上侧的图片
        imgsArrangeTopArr.forEach((value, index) => {
            imgsArrangeTopArr[index] = {
                pos: {
                    top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
                    left: getRangeRandom(vPosRangeX[0], vPosRangeX[1])
                },
                rotate: get30DegRandom(),
                isCenter: false
            }
        })

        for (let i = 0, j = imgsArrangeArr.length, k = j / 2; i < j; i++) {

            let hPosRangeLORX = []

            // 前半部分布局左边， 右半部分布局右边
            if (i < k) {
                hPosRangeLORX = hPosRangeLeftSecX;
            } else {
                hPosRangeLORX = hPosRangeRightSecX;
            }

            imgsArrangeArr[i] = {
                pos: {
                    top: getRangeRandom(hPosRangeY[0], hPosRangeY[1]),
                    left: getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1])
                },
                rotate: get30DegRandom(),
                isCenter: false
            };
            // console.log("imgsArrangeArr[i]:", imgsArrangeArr[i]);

        }


        if (imgsArrangeTopArr && imgsArrangeTopArr[0]) {
            imgsArrangeArr.splice(topImgSpliceIndex, 0, imgsArrangeTopArr[0]);
        }

        imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);
        console.log("arrange:",imgsArrangeArr)
        this.setState({
            imgsArrangeArr: imgsArrangeArr
        })

    }


    center = (index) => () => {
        // console.log("center-index:",index)
        this.rearrange(index)
    }

    inverse = (index) => () => {
        // console.log("inverse-index:",index)
        let imgsArrangeArr = this.state.imgsArrangeArr;

        imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse

        this.setState({
            imgsArrangeArr: imgsArrangeArr
        })
    }

    componentDidMount() {

        //获取舞台大小
        let stageDOM = ReactDOM.findDOMNode(this.refs.stage),
            stageW = stageDOM.scrollWidth,
            stageH = stageDOM.scrollHeight,
            halfStageW = Math.ceil(stageW / 2),
            halfStageH = Math.ceil(stageH / 2);

        //获取图片的大小
        let imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
            imgW = imgFigureDOM.scrollWidth,
            imgH = imgFigureDOM.scrollHeight,
            halfImgW = Math.ceil(imgW / 2),
            halfImgH = Math.ceil(imgH / 2)

        //计算中心图片的位置点
        this.Constant.centerPos = {
            left: halfStageW - halfImgW,
            top: halfStageH - halfImgH
        }

        //计算左侧,右侧区域图片排布位置的取值范围
        this.Constant.hPosRange.leftSecX[0] = -halfImgW;    //最小值
        this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;    //最大值
        this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;   //最小值
        this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW    //最大值
        this.Constant.hPosRange.y[0] = -halfImgH;
        this.Constant.hPosRange.y[1] = stageH - halfImgH;

        //计算上侧区域图片排布位置的取值范围
        this.Constant.vPosRange.topY[0] = -halfImgH;
        this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
        this.Constant.vPosRange.x[0] = halfStageW - imgW;
        this.Constant.vPosRange.x[1] = halfStageW;

        this.rearrange(0)

    }


    render() {
        let controllerUnits = [], imgFigures = [];
        // console.log("after render:this.state.imgsArrangeArr ",this.state.imgsArrangeArr);
        imageDatas.forEach((value, index) => {
            imgFigures.push(
                <ImgFigure
                    key={index}
                    data={value}
                    ref={'imgFigure' + index}
                    arrange={this.state.imgsArrangeArr[index]}
                    inverse={this.inverse(index)}
                    center={this.center(index)}
                />
            )

            controllerUnits.push(
                <ControllerUnit
                    key={index}
                    arrange={this.state.imgsArrangeArr[index]}
                    inverse={this.inverse(index)}
                    center={this.center(index)}
                />
            );
            // console.log(this.state.imgsArrangeArr[index]);
        })


        return (
            <section className="stage" ref="stage">
                <section className="img-sec">
                    {imgFigures}
                </section>
                <nav className="controller-nav">
                    {controllerUnits}
                </nav>
            </section>
        );
    }
}

export default App;
