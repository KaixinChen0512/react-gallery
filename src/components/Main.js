require('normalize.css/normalize.css');
require('styles/App.styl');

import React from 'react';

//获取图片数据，将图片名信息转成url路径
let imageDatas = require('../data/imgdata.json');

imageDatas = (function getImgUrl(imgDatasArr) {
  for (var i = 0, j = imgDatasArr.length; i < j; i++) {
    var oneimgData = imgDatasArr[i];
    oneimgData.imageURL = require('../images/' + oneimgData.fileName);
    imgDatasArr[i] = oneimgData; //这是引用，可以不要，谨慎起见
  }
  return imgDatasArr;
})(imageDatas);

/*
 * 获取区间内随机值
 */
function getRangeRandom(low, high) {
  return Math.ceil(Math.random() * (high - low) + low);
}

/*
* 获取0-30之间的一个正负旋转角度的范围
*/
function getDegRandom(){
  let baseDeg = 30;
  return (Math.random()>0.5?'':'-')+Math.ceil(Math.random()*baseDeg);
}

class ImgFigure extends React.Component {
  /*
  * ImgFigure 的点击处理函数，正反面的切换
  */
  handleClick(e) {
    if(this.props.arrange.isCenter){
      this.props.inverse();
    } else {
      this.props.center();
    }

    e.stopPropagation();
    e.preventDefault();
  }
  render() {
    var styleObj = {};

    //如果props有指定值则使用
    if (this.props.arrange.pos) {
      styleObj = this.props.arrange.pos;
    }

    //如果图片旋转角度有值，且不为0
    if(this.props.arrange.rotate){
      //对各种浏览器的兼容性，必须用驼峰式命名
      ['MozTransform','msTransform','WebkitTransform','transform'].forEach(function(value){
        styleObj[value] = 'rotate('+this.props.arrange.rotate+'deg)';
      }.bind(this));
    }

    //添加z-index 避免遮盖
    if(this.props.arrange.isCenter){
      styleObj.zIndex = 11;
    } else {
      styleObj.zIndex = 0;
    }

    var igmFigureClassName = 'img-figure';
    //如果已翻转则添加is-inverse的类名
    igmFigureClassName += this.props.arrange.isInverse?' is-inverse':'';//注意类名之间用空格分隔

    return ( < figure className = {igmFigureClassName}
      style = {
        styleObj
      }
      ref ="figure"
      onClick={
        this.handleClick.bind(this)
      }
      >
      < img className='img-back' src = {
        this.props.data.imageURL
      }
      alt = {
        this.props.data.title
      }

      /> < figcaption >
        < h2 className = "img-title" >
          {this.props.data.title}
        < /h2>
        <div className = 'img-back' onClick={this.handleClick.bind(this)} >
          <p>
            {this.props.data.desc}
          </p>
        </div>
      < /figcaption > < /figure>);
  }
}
//控制组件
class ControllerUnit extends React.Component {
  handleClick(e){
    //如果点击的居中图片，则翻转；否则居中
    if(this.props.arrange.isCenter){
      this.props.inverse();
    } else {
      this.props.center();
    }

    e.stopPropagation();
    e.preventDefault();
  }
  render() {
    var controllerUintClassName ='controller-unit';

    // 如果对应的是居中的图片，显示控制按钮的居中态
    if(this.props.arrange.isCenter) {
      controllerUintClassName += ' is-center';
    }

    // 如果对应的是翻转的图片，显示控制按钮的翻转态
    if(this.props.arrange.isInverse) {
      controllerUintClassName += ' is-inverse';
    }

    return (
        <span className={controllerUintClassName} onClick={this.handleClick.bind(this)}></span>
    );
  }
}
//大管家组件
class AppComponent extends React.Component {
  constructor(props) {
      super(props)
      this.state = {
        imgArrangeArr: [
          /*
          {
            pos: {
              left: 0,
              right: 0
            },
            rotate: 0,
            isInverse: false //图片默认正面不旋转
          },
          isCenter:false //图片默认不居中
          */
      ]
      };

      this.Constant = { //常量的key
        centerPos: {
          left: 0,
          right: 0
        },
        hPosRange: { //水平方向取值范围
          leftSecX: [0, 0],
          rightSecX: [0, 0],
          y: [0, 0]
        },
        vPosRange: { //垂直方向取值范围
          x: [0, 0],
          topY: [0, 0]
        }
      }
    }
    /*
     *不是每一次 render 都会执行
     */
  componentDidMount() {
      /*组件加载后，计算每张图片的位置范围*/
      //得到舞台的大小
      var stageDOM = this.refs.stage,
            /*
            scrollWidth：对象的实际内容的宽度，不包边线宽度，会随对象中内容超过可视区后而变大。
            clientWidth：对象内容的可视区的宽度，不包滚动条等边线，会随对象显示大小的变化而改变。
            offsetWidth：对象整体的实际宽度，包滚动条等边线，会随对象显示大小的变化而改变。
            */
        stageW = stageDOM.scrollWidth,
        stageH = stageDOM.scrollHeight,
        halfStageW = Math.ceil(stageW / 2),
        halfStageH = Math.ceil(stageH / 2);
      //取得其中一个imgFigure的大小
      var imgFigureDom = this.refs.imgFigure0.refs.figure,
        imgW = imgFigureDom.scrollWidth,
        imgH = imgFigureDom.scrollHeight,
        halfImgW = Math.ceil(imgW / 2),
        halfImgH = Math.ceil(imgH / 2);
      //计算中心图片的位置点
      this.Constant.centerPos = {
        left: halfStageW - halfImgW,
        top: halfStageH - halfImgH
      };

      //计算左右侧，图片位置取值范围
      this.Constant.hPosRange.leftSecX[0] = -halfImgW;
      this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
      this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
      this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
      this.Constant.hPosRange.y[0] = -halfImgH;
      this.Constant.hPosRange.y[1] = stageH - halfImgH;

      //计算上侧，图片位置的取值范围
      this.Constant.vPosRange.topY[0] = -halfImgH;
      this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
      this.Constant.vPosRange.x[0] = halfStageW - imgW;
      this.Constant.vPosRange.x[1] = halfStageW;
      //指定图片数组中的第一张居中
      this.rearrange(0);
    }

  /*
  * 翻转图片
  * @params index 输入当前被执行inverse操作的图片对应的index
  * @return {Function} 这是一个闭包函数，其内return一个真正等待被执行的函数
  */
  inverse(index) {
    return function (){
      var imgArrangeArr = this.state.imgArrangeArr;

      imgArrangeArr[index].isInverse = !imgArrangeArr[index].isInverse;
      //触发视图重新渲染
      this.setState({
        imgArrangeArr: imgArrangeArr
      });
    }.bind(this);
  }
  /*
  * 利用rearrange函数，居中对应index的图片
  * @param index 指定需要居中的图片的index
  */
  center(index){
    return function(){
      this.rearrange(index);
    }.bind(this);
  }
  /*
   * 重新布局所有图片，传入居中的index
   * @param centerIndex 指定居中的图片的
   */
  rearrange(centerIndex) {
    var imgArrangeArr = this.state.imgArrangeArr,
      Constant = this.Constant,
      centerPos = Constant.centerPos,
      hPosRange = Constant.hPosRange,
      vPosRange = Constant.vPosRange,
      hPosRangeLeftSecX = hPosRange.leftSecX,
      hPosRangeRightSecX = hPosRange.rightSecX,
      vPosRangeTopY = vPosRange.topY,
      vPosRangeX = vPosRange.x,
      //用来存储布局在上册图片的状态信息
      imgsArrangeTopArr = [],
      //上侧图片的个数，可有可无。0或者1
      topImgNum = Math.floor(Math.random() * 2),
      //上侧图片是从哪个位置拿出来的
      topImgSpliceIndex = 0,
      //存放中心图片的状态信息
      imgsArrangeCenterArr = imgArrangeArr.splice(centerIndex, 1);
    //居中 centerIndex 的图片，操作位置信息
    imgsArrangeCenterArr[0] ={
      pos: centerPos,
      rotate : 0,
      isCenter: true
    }

    //取出要布局上侧图片的状态信息（不止包含位置）
    topImgSpliceIndex = Math.ceil(Math.random() * (imgArrangeArr.length - topImgNum));
    imgsArrangeTopArr = imgArrangeArr.splice(topImgSpliceIndex, topImgNum);

    //布局上侧图片
    imgsArrangeTopArr.forEach(function (value, index) {
      imgsArrangeTopArr[index] = {
        pos :{
          top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
          left: getRangeRandom(vPosRangeX[0], vPosRangeX[1])
        },
        rotate:getDegRandom(),
        isCenter: false
      }
    });

    //布局左右两侧的图片
    for (var i = 0, j = imgArrangeArr.length, k = j / 2; i < j; i++) {
      var hPosRangeLORX = null; //左区域或者右区域的取值范围

      //前半部分布局左边，右半部分布局右边
      if (i < k) {
        hPosRangeLORX = hPosRangeLeftSecX;
      } else {
        hPosRangeLORX = hPosRangeRightSecX;
      }
      //当前的位置对象
      imgArrangeArr[i] ={
        pos : {
          top: getRangeRandom(hPosRange.y[0], hPosRange.y[1]),
          left: getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1])
        },
        rotate:getDegRandom(),
        isCenter:false
      };
    }

    //把取出来的上侧图片的位置信息放回去
    if (imgsArrangeTopArr && imgsArrangeTopArr[0]) {
      imgArrangeArr.splice(topImgSpliceIndex, 0, imgsArrangeTopArr[0]);
    }
    //把取出来的中心图片的位置信息放回去
    imgArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);
    //触发重新渲染
    this.setState({
      imgArrangeArr: imgArrangeArr
    });
  }

  render() {
    var controllerUnits = [],
      imgFigures = [];
    imageDatas.forEach(function (value, index) {
        //如果当前没有状态对象，则初始化
        if (!this.state.imgArrangeArr[index]) {
          this.state.imgArrangeArr[index] = {
            pos: {
              left: 0,
              top: 0
            },
            rotate: 0,
            isInverse: false,
            isCenter: false
          }
        }
        imgFigures.push( < ImgFigure data = {
            value
          }
          ref = {
            'imgFigure' + index
          }
          key = {
             index
          }
          arrange = {
            this.state.imgArrangeArr[index]
          }
          inverse = {
            this.inverse(index).bind(this)  //多次修改this绑定！！
          }
          center ={this.center(index).bind(this)}
          />);
        controllerUnits.push(<ControllerUnit key ={index} arrange={this.state.imgArrangeArr[index]} inverse={this.inverse(index).bind(this)} center={this.center(index).bind(this)}/>)

        }.bind(this));
      return ( < section className = "stage"
        ref = "stage" > < section className = "img-sec" > {
          imgFigures
        } < /section>  < nav className = "controller-nav" > {
        controllerUnits
      } < /nav> < /section > );
  }
}
AppComponent.defaultProps = {};

export default AppComponent;
