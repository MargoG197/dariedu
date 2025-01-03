import { useState, useContext } from 'react';
import * as Form from '@radix-ui/react-form';
import TextareaAutosize from 'react-textarea-autosize';
import { submitFeedbackDeliveryoOrTask, type TFeedbackTypes } from '../../api/feedbackApi';
import ConfirmModal from '../ui/ConfirmModal/ConfirmModal';
import Big_pencil from './../../assets/icons/big_pencil.svg?react'
import { TokenContext } from '../../core/TokenContext';
import { UserContext } from '../../core/UserContext';
import CloseIcon from "../../assets/icons/closeIcon.svg?react";

interface IDeliveryFeedbackProps{
  onOpenChange: (open: boolean) => void
  onSubmitFidback: (e: boolean) => void
  delivery: boolean //// true если это доствка false  если это доброе дело
  deliveryOrTaskId:number
}


const CancelledDeliveryOrTaskFeedback: React.FC<IDeliveryFeedbackProps> = ({onOpenChange, onSubmitFidback, delivery, deliveryOrTaskId}) => {


  const [feedbacks, setFeedbacks] = useState({
    fb1Cancel: localStorage.getItem('fb1Cancel') ?? '',
  });

 const buttonActive = true;
 const [fedbackSendFail, setFedbackSendFail] = useState(false)

  ////// используем контекст
  const {token} = useContext(TokenContext);
  const { isIphone } = useContext(UserContext);
  ////// используем контекст



  type TReasons = keyof typeof feedbacks;
  // при каждом изменении в полях формы вносим изменения в юзера и обновляем localeStorage
  function handleFormFieldChange(fieldName: TReasons, value: string) {
    setFeedbacks({
      ...feedbacks,
      [fieldName]: value,
    });
    localStorage.setItem(fieldName, value);
  }

  // function handleInfoInput() {
  //   if (feedbacks.fb1Cancel.length >= 0 ) {
  //     setButtonActive(true)
  //   } else setButtonActive(false)
  // }


  async function handleDeliveryOrTaskCancelledFeedbackSubmit(deliveryId: number) {
      let fedbackText: string;
      let type:TFeedbackTypes
      if (delivery) {
      type="canceled_delivery"
      fedbackText = `Поделитесь, пожалуйста, почему вы отказались от участия в доставке? Ответ: ${feedbacks.fb1Cancel}`
      } else {
        type="canceled_task"
      fedbackText = `Поделитесь, пожалуйста, почему вы отказались от участия в добром деле? Ответ: ${feedbacks.fb1Cancel}`
    }

    if (token) {
      try {
        const response = await submitFeedbackDeliveryoOrTask(token, delivery, type, fedbackText, deliveryId)
        if (response) {
        feedbacks.fb1Cancel = "";
        localStorage.removeItem("fb1Cancel");
        onOpenChange(false)
        onSubmitFidback(true)
        }
      } catch (err) {
        setFedbackSendFail(true)
        console.log(err, "handleFormSubmit deliveryFeedback")
      }
    } else {
      setFedbackSendFail(true)
    }
 
  }


     ////поднимаем текстэриа в фокус пользователя для айфона
function handleFocus(e:React.FocusEvent<HTMLTextAreaElement, Element>) {
  e.target.scrollIntoView({ block: "center", behavior: "smooth" });
  }
  
  return (
    <>
      <div className={` pb-10 w-full max-w-[500px] flex flex-col rounded-t-2xl  bg-light-gray-white dark:bg-light-gray-7-logo ${isIphone ? " h-full top-0 fixed " : " bottom-0 h-fit "}` }
      onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-center self-start mt-[25px] mx-4 justify-between">
          <div className='flex items-center'>
            <Big_pencil className="w-[32px] h-[32px] min-w-[32px] min-h-[32px] fill-[#0A0A0A] bg-light-gray-1 rounded-full dark:fill-[#F8F8F8] dark:bg-light-gray-6"/> 
          {delivery ? (
         <p className="ml-[14px] font-gerbera-h3 dark:text-light-gray-1">
         Поделитесь, пожалуйста, почему вы отказались от участия в доставке?
            </p>
         ) : (<p className="ml-[14px] font-gerbera-h3 dark:text-light-gray-1">
          Поделитесь, пожалуйста, почему вы отказались от участия в добром деле?
          </p>)}
          </div>
          
          {isIphone && <CloseIcon className='fill-light-gray-3 w-8 h-8 min-w-8 min-h-8 ' onClick={()=>onOpenChange(false)} />}
        </div>
        <Form.Root
           className=" flex flex-col items-center justify-center"
            onSubmit={e => {
            e.preventDefault();
            handleDeliveryOrTaskCancelledFeedbackSubmit(deliveryOrTaskId)
          }}
         >
          <div  className='flex flex-col px-4 w-full' >
            <Form.Field name="fb1" className="mt-4">
            <Form.Label className="font-gerbera-sub2 text-light-gray-4 line-clamp-3 dark:text-light-gray">Расскажите в свободной форме</Form.Label>
              <Form.Control asChild>
                <TextareaAutosize
                  onFocus={(e)=>handleFocus(e)}
                  maxRows={5}
                  className="w-full min-w-[328px] bg-light-gray-1 h-max min-h-[68px] rounded-2xl py-4 px-3 text-light-gray-8-text font-gerbera-sub2 focus: outline-0 mt-2
                placeholder:text-light-gray-3 dark:bg-light-gray-6 dark:text-light-gray-1 dark:placeholder:text-light-gray-1"
                  
                  defaultValue={localStorage.getItem('fb1Cancel') ?? ''}
                  onChange={e => {
                    handleFormFieldChange('fb1Cancel', e.target.value);
                  }}
                />
              </Form.Control>
            </Form.Field>
          </div>
          <button className={`${buttonActive ? "btn-B-GreenDefault" : "btn-B-GreenInactive dark:bg-light-gray-5 dark:text-light-gray-4"} my-4 `}
            onClick={(e) => {
              if (buttonActive) {
              }else e.preventDefault()
          }}
          >Отправить</button>
        </Form.Root>
      </div>
        <ConfirmModal
        isOpen={fedbackSendFail}
        onOpenChange={setFedbackSendFail}
        onConfirm={() => {setFedbackSendFail(false);}}
        title={"Упс, что-то пошло не так"}
        description=""
        confirmText="Ок"
        isSingleButton={true}
      />
    </>
  );
};

export default CancelledDeliveryOrTaskFeedback;
