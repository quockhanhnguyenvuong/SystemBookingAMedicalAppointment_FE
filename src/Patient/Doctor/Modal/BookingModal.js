import React, { Component } from "react";
import "./BookingModal.scss";
import { connect } from "react-redux";
import ProfileDoctor from "../ProfileDoctor";
import _ from "lodash";
import DatePicker from "../../../components/Input/DatePicker";
// import * as actions from "../../../store/actions";
import { toast } from "react-toastify";
import {
  getAllCodeService,
  postPatientBookAppointment,
} from "../../../services/userService";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import moment from "moment";

class BookingModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phonenumber: "",
      email: "",
      address: "",
      reason: "",
      birthday: "",

      firstName: "",
      lastName: "",
      doctorId: "",
      gender: "",
      genderArr: [],
      timeType: "",
      fullName: "",
      bookingType: "",
    };
  }

  async componentDidMount() {
    await this.getGenderFormReact();
    let genderArr = this.state.genderArr;
    this.setState({
      gender: genderArr && genderArr.length > 0 ? genderArr[0].keyMap : "",
    });
  }

  getGenderFormReact = async () => {
    let response = await getAllCodeService("gender");
    if (response && response.errCode === 0) {
      this.setState({
        genderArr: response.data,
      });
    }
  };

  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.dataTime !== prevProps.dataTime) {
      if (this.props.dataTime !== !_.isEmpty(this.props.dataTime)) {
        let doctorId = this.props.dataTime.doctorId;
        let timeType = this.props.dataTime.timeType;
        this.setState({
          doctorId: doctorId,
          timeType: timeType,
        });
      }
    }
  }

  handleOnchangeInput = (event, id) => {
    let valueInput = event.target.value;
    let stateCopy = { ...this.state };
    stateCopy[id] = valueInput;
    this.setState({
      ...stateCopy,
    });
  };

  handleOnchangeDatePicker = (date) => {
    this.setState({
      birthday: date[0],
    });
  };

  onChangInput = (event, id) => {
    let copyState = { ...this.state };
    copyState[id] = event.target.value;
    this.setState({
      ...copyState,
    });
  };

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  buildTimeBooking = (dataTime) => {
    // console.log("check renderTimeBooking: ", dataTime);
    if (dataTime && !_.isEmpty(dataTime)) {
      let time = dataTime.timeTypeData.valueVI;

      let date = moment.unix(+dataTime.date / 1000).format("dddd - DD/MM/YYYY");
      return `${time} - ${this.capitalizeFirstLetter(date)}`;
    }
    return "";
  };

  buildDoctorName = (dataTime) => {
    if (dataTime && !_.isEmpty(dataTime)) {
      let name = `${dataTime.doctorData.lastName} ${dataTime.doctorData.firstName}`;
      return name;
    }
    return "";
  };

  handleConfirmBooking = async () => {
    // validate input
    // data.email || !data.doctorId || !data.timeTypeData || !data.date
    let date = new Date(this.state.birthday).getTime();
    let timeString = this.buildTimeBooking(this.props.dataTime);
    let doctorName = this.buildDoctorName(this.props.dataTime);
    // console.log("check time string", timeString);
    let res = await postPatientBookAppointment({
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      fullName: this.state.firstName + " " + this.state.lastName,
      phonenumber: this.state.phonenumber,
      email: this.state.email,
      address: this.state.address,
      reason: this.state.reason,
      date: date,
      gender: this.state.gender,
      doctorId: this.state.doctorId,
      timeType: this.state.timeType,
      timeString: timeString,
      doctorName: doctorName,
      bookingType: this.props.type,
    });

    if (res && res.errCode === 0) {
      toast.success("Booking a new appointment succeed!");
      this.props.closeBookingClose();
    } else {
      toast.error("Booking a new appointment error!");
    }
    console.log("check err", this.state);
  };
  handleFillInfoUser = (userInfo) => {
    this.setState({
      phonenumber: userInfo.phonenumber,
      email: userInfo.email,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      gender: userInfo.gender,
      address: userInfo.address,
    });
  };
  render() {
    let { isOpenModal, closeBookingClose, dataTime, type, doctorIdFromParent } =
      this.props;
    let genders = this.state.genderArr;
    let doctorId = "";
    if (dataTime && !_.isEmpty(dataTime)) {
      doctorId = dataTime.doctorId;
    }
    // console.log("check dataTime:", dataTime);
    console.log("check userInfo:", this.props.userInfo);
    return (
      <Modal
        isOpen={isOpenModal}
        className="modal-container"
        size="lg"
        centered
        // backdrop={true}
      >
        <ModalHeader className="d-flex">
          <span className="left">{this.props.title}</span>
        </ModalHeader>
        <ModalBody>
          <div className="modal-body">
            <div className="doctor-infor">
              <ProfileDoctor
                doctorId={type === "ONLINE" ? doctorId : doctorIdFromParent}
                isShowDescriptionDoctor={true}
                dataTime={dataTime}
                type={type}
              />
            </div>

            <div className="container">
              <div className="row">
                <div
                  className="col-12 text-end mb-1 text-info"
                  onClick={() => this.handleFillInfoUser(this.props.userInfo)}
                >
                  <span>Điền giúp thông tin?</span>
                </div>
                <div className="col-6 form-group mb-3">
                  <label>Họ</label>
                  <input
                    className="form-control"
                    value={this.state.firstName}
                    onChange={(event) =>
                      this.handleOnchangeInput(event, "firstName")
                    }
                  />
                </div>
                <div className="col-6 form-group mb-3">
                  <label>Tên</label>
                  <input
                    className="form-control"
                    value={this.state.lastName}
                    onChange={(event) =>
                      this.handleOnchangeInput(event, "lastName")
                    }
                  />
                </div>
                <div className="col-6 form-group mb-3">
                  <label>Số điện thoại</label>
                  <input
                    className="form-control"
                    value={this.state.phonenumber}
                    onChange={(event) =>
                      this.handleOnchangeInput(event, "phonenumber")
                    }
                  />
                </div>
                <div className="col-6 form-group mb-3">
                  <label>Địa chỉ Email</label>
                  <input
                    className="form-control"
                    value={this.state.email}
                    onChange={(event) =>
                      this.handleOnchangeInput(event, "email")
                    }
                  />
                </div>
                <div className="col-12 form-group mb-3">
                  <label>Địa chỉ liên hệ</label>
                  <input
                    className="form-control"
                    value={this.state.address}
                    onChange={(event) =>
                      this.handleOnchangeInput(event, "address")
                    }
                  />
                </div>

                <div className="col-12 form-group mb-3">
                  <label>Lý do khám</label>
                  <input
                    className="form-control"
                    value={this.state.reason}
                    onChange={(event) =>
                      this.handleOnchangeInput(event, "reason")
                    }
                  />
                </div>

                <div className="col-6 form-group mb-3">
                  <label>Ngày sinh</label>
                  <DatePicker
                    onChange={this.handleOnchangeDatePicker}
                    className="form-control"
                    value={this.state.birthday}
                  />
                </div>
                <div className="col-6 form-group mb-3">
                  <label>Giới tính </label>
                  <select
                    className="form"
                    value={this.state.gender}
                    onChange={(event) => {
                      this.onChangInput(event, "gender");
                    }}
                  >
                    {genders &&
                      genders.length > 0 &&
                      genders.map((item, index) => {
                        return (
                          <option selected key={index} value={item.keyMap}>
                            {item.valueVI}
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            className="btn "
            onClick={() => this.handleConfirmBooking()}
          >
            Xác nhận
          </Button>
          <Button color="secondary" className="btn" onClick={closeBookingClose}>
            Hủy
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.user.userInfo,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(BookingModal);
