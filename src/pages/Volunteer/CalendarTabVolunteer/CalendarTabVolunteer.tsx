import {useState, useContext, useEffect} from 'react'
import Calendar from "../../../components/Calendar/Calendar";
import NearestDeliveryVolunteer from "../../../components/NearestDelivery/NearestDeliveryVolunteer";
import { getVolunteerDeliveries, postDeliveryCancel, type IDelivery, type IVolunteerDeliveries } from '../../../api/apiDeliveries';
import { UserContext } from '../../../core/UserContext';
///import DeliveryType from '../../../components/ui/Hr/DeliveryType';
import { getMonthCorrectEndingName, getMetroCorrectName } from '../../../components/helperFunctions/helperFunctions';
import ConfirmModal from '../../../components/ui/ConfirmModal/ConfirmModal';
import { getMyFeedbacks, type TMyFeedback } from '../../../api/feedbackApi';
import CancelledDeliveryOrTaskFeedback from '../../../components/DeliveryOrTaskFeedback/CancelledDeliveryOrTaskFeedback';
import { Modal } from '../../../components/ui/Modal/Modal';



const CalendarTabVolunteer = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());/// дата для календаря
  const [myCurrent, setMyCurrent] = useState<IDelivery[]>([]) ////доставки записанные на меня
  const [myPast, setMyPast] = useState<IDelivery[]>([]) //// мои просшендшие доставки
  const [cancelDeliverySuccess, setCancelDeliverySuccess] = useState<boolean>(false) //// доставка успешно отмемена
  const [cancelDeliveryFail, setCancelDeliveryFail]= useState<boolean>(false)////// доставку не удалось отменить, произошла ошибка
  const [cancelDeliverySuccessString, setCancelDeliverySuccessString] = useState<string>(""); ////// если доставка отменена то тут будут данные по отмененной доставке, метро, дата и время
  const [completedDeliveryFeedbacks, setCompletedDeliveryFeedbacks] = useState<number[]>([]); ////тут все мои отзывы
  const [isFeedbackSubmitedModalOpen, setIsFeedbackSubmitedModalOpen] =  useState(false); ////// открываем модальное окно, чтобы проинформировать пользоватенля что фидбэк по завершенной заявке отправлен
  const [cancelDeliveryReasonOpenModal, setCancelDeliveryReasonOpenModal] = useState(false);  /// модальное окно для отправки отзыва
  const [isCancelledDeliveryFeedbackSubmited, setIsCancelledDeliveryFeedbackSubmited] =  useState(false);
  const [cancelId, setCancelId] = useState<number>();

  ////// используем контекст юзера, чтобы вывести количество доступных баллов
   const userValue = useContext(UserContext);
   const token = userValue.token;
  ////// используем контекст

  async function getMyDeliveries() {
    const current: IDelivery[] = [];
    const past: IDelivery[] = [];
   
    try {
       if (token) {
         let result: IVolunteerDeliveries = await getVolunteerDeliveries(token);
         if (result) {
           result['мои активные доставки'].forEach(i => { current.push(i)});
           result['мои завершенные доставки'].forEach(i => { past.push(i)});
           //result['свободные доставки'].forEach(i => { avaliable.push(i)});     
           setMyCurrent(current);
           setMyPast(past)}
    }
    } catch (err) {
      console.log(err, "CalendarTabVolunteer getMyDeliveries fail")
    }
  }
  
  async function getAllMyFeedbacks() {
    if (token) {
      try {
        let result:TMyFeedback[] = await getMyFeedbacks(token);
        if (result) {
          let allMySubmitedFeedbacksForCompletedDeliveries:number[] = []
          result.forEach(i => {
            if (typeof i.delivery == 'number' && i.type == 'completed_delivery') {
              allMySubmitedFeedbacksForCompletedDeliveries.push(i.delivery)
            }
          })
          setCompletedDeliveryFeedbacks(allMySubmitedFeedbacksForCompletedDeliveries)
        }
      } catch (err) {
        console.log("getAllMyFeedbacks volunteer tab has failed")
    }
  }
  }

  
  useEffect(() => {
    getMyDeliveries()
  }, [cancelDeliverySuccess])

  useEffect(() => {
    getAllMyFeedbacks()
  }, [isFeedbackSubmitedModalOpen])


 ////функция чтобы волонтер отменил взятую доставку
async function cancelTakenDelivery(delivery:IDelivery) {
  const id: number = delivery.id;
try {
   if (token) {
     let result: IDelivery = await postDeliveryCancel(token, id, delivery);
     if (result) {
       const deliveryDate = new Date(delivery.date);
       const date = deliveryDate.getDate();
       const month = getMonthCorrectEndingName(deliveryDate);
       const hours = deliveryDate.getHours() < 10 ? '0' + deliveryDate.getHours() : deliveryDate.getHours();
       const minutes = deliveryDate.getMinutes() < 10 ? '0' + deliveryDate.getMinutes() : deliveryDate.getMinutes();    
       const subway = getMetroCorrectName(delivery.location.subway)
       const finalString = `м. ${subway}, ${date} ${month}, ${hours}:${minutes}`;
       setCancelDeliveryReasonOpenModal(true)/// открываем модалку для отзыва о причине отмены
       setCancelDeliverySuccessString(finalString);  
       setCancelId(id)
       setCancelDeliverySuccess(true)
  }
}
} catch (err) {
  setCancelDeliveryFail(true)
  console.log(err, "CalendarTabVolunteer cancelTakenDelivery has failed")
}
  }
  
  
  
  
  return (
    <>
      <div className="mt-2 mb-4 flex flex-col items-center" >
        <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
        <div className='flex flex-col h-full mb-20 overflow-auto'>
          {myCurrent.length > 0 ?
              (myCurrent.map((i) => {
                const currentStatus = i.in_execution == true ? "active" : "nearest";
                return(
                <div key={i.id}>
                    <NearestDeliveryVolunteer delivery={i} status={currentStatus} cancelFunc={cancelTakenDelivery}  />
                </div>)
              })
            ) : ""
          
          }
          {myPast.length > 0 ? (
            myPast.map((i: IDelivery) => (
              completedDeliveryFeedbacks.length > 0 ? (
                completedDeliveryFeedbacks.includes(i.id) ? (
              <div key={i.id}>
              <NearestDeliveryVolunteer delivery={i} status={"completed"} isFeedbackSubmitedModalOpen={isFeedbackSubmitedModalOpen} setIsFeedbackSubmitedModalOpen={setIsFeedbackSubmitedModalOpen} feedbackSubmited={true} />
              </div>
                ) : (
                  <div key={i.id}>
            <NearestDeliveryVolunteer delivery={i} status={"completed"} isFeedbackSubmitedModalOpen={isFeedbackSubmitedModalOpen} setIsFeedbackSubmitedModalOpen={setIsFeedbackSubmitedModalOpen} feedbackSubmited={false} />
            </div>   
              )) : (
               <div key={i.id}>
            <NearestDeliveryVolunteer delivery={i} status={"completed"} isFeedbackSubmitedModalOpen={isFeedbackSubmitedModalOpen} setIsFeedbackSubmitedModalOpen={setIsFeedbackSubmitedModalOpen} feedbackSubmited={false} />
            </div>)
            ))) : ""
          }
       
        </div>
          {/* <div className="w-full h-vh flex flex-col items-center py-[20px] mt-2 rounded-2xl">
          <img src="./../../src/assets/icons/LogoNoTaskYet.svg" />
          <p className="font-gerbera-h2 text-light-gray-black w-[300px] mt-[28px]">Пока нет запланированных добрых дел</p>
        </div>   */}
      </div>    
      <ConfirmModal
        isOpen={cancelDeliverySuccess}
        onOpenChange={setCancelDeliverySuccess}
        onConfirm={() => setCancelDeliverySuccess(false)}
        title={`Участие в доставке ${cancelDeliverySuccessString} отменено`}
        description=""
        confirmText="Ок"
        isSingleButton={true}
      />
        <ConfirmModal
        isOpen={cancelDeliveryFail}
        onOpenChange={setCancelDeliveryFail}
        onConfirm={() => setCancelDeliveryFail(false)}
        title={`Упс, что-то пошло не так, попробуйте позже`}
        description=""
        confirmText="Ок"
        isSingleButton={true}
      />
      {cancelId ? (
      <Modal isOpen={cancelDeliveryReasonOpenModal} onOpenChange={setCancelDeliveryReasonOpenModal} >
      <CancelledDeliveryOrTaskFeedback
      onOpenChange={setCancelDeliveryReasonOpenModal}
      onSubmitFidback={setIsCancelledDeliveryFeedbackSubmited}
      delivery={true}
      deliveryOrTaskId={cancelId}
      />
      </Modal>
      ) : ""}
      <ConfirmModal
      isOpen={isCancelledDeliveryFeedbackSubmited}
      onOpenChange={setIsCancelledDeliveryFeedbackSubmited}
      onConfirm={() => setIsCancelledDeliveryFeedbackSubmited(false)}
      title={
        <p>
          Спасибо, что поделились!
          <br /> Это важно.
        </p>
      }
      description=""
      confirmText="Закрыть"
      isSingleButton={true}
    />
      
    </>
  )
}

export default CalendarTabVolunteer