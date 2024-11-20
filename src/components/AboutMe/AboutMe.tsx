import React, { useState, useContext } from 'react';
import * as Form from '@radix-ui/react-form';
import TextareaAutosize from 'react-textarea-autosize';
//import Big_pencil from './../../assets/icons/big_pencil.svg?react'
import { UserContext } from '../../core/UserContext';
//import { createRequestMessage, type TRequestMessageRequest } from '../../api/requestMessageApi';
import ConfirmModal from '../ui/ConfirmModal/ConfirmModal';
import { IUser } from '../../core/types';
import { metier, patchUser } from '../../api/userApi';
import InputOptions, { type T } from '../../pages/Registration/InputOptions';
import RightArrowIcon from '../../assets/icons/arrow_right.svg?react';

type TAboutMeProps = {
  onClose: React.Dispatch<React.SetStateAction<boolean>>,
}

const AboutMe:React.FC<TAboutMeProps> = ({onClose}) => {
  type TReasons = keyof typeof requestBody;
   ////// используем контекст
  const userValue = useContext(UserContext);
  const token = userValue.token;
  const userId = userValue.currentUser?.id
  const userMetier = userValue.currentUser?.metier
  const aboutMe = userValue.currentUser?.interests;
  ////// используем контекст

//console.log(aboutMe)
    const [requestBody, setRequestBody] = useState({
    about_me: localStorage.getItem('about_me') ?? aboutMe ?? "",
  });

  const [buttonActive, setButtonActive] = useState(false)
  const [requestAboutMeFail, setRequestAboutMeFail] = useState(false)
  const [requestAboutMeSuccess, setRequestAboutMeSuccess] = useState(false)

    ///// данные для инпута для выбора рода дейтельности
    const [clickedMetier, setClickedMetier] = useState(false);
    const [metierName, setMetierName] = useState<T>(userMetier ? userMetier : "other");
    ///// данные для инпута для выбора рода дейтельности


  // при каждом изменении в полях формы вносим изменения в юзера и обновляем localeStorage
  function handleFormFieldChange(fieldName: TReasons, value: string) {
    setRequestBody({
      ...requestBody,
      [fieldName]: value,
    });
    localStorage.setItem(fieldName, value);
  }

  async function handleRequestSubmit() {

    const requestObject:Partial<IUser> = {
      metier: metierName as string,
      interests: requestBody.about_me,
 } 
      try {
          if (userId && token) {
        const response = await patchUser(userId, requestObject, token)
            if (response) {
              if (userValue.currentUser) {
                userValue.currentUser.metier = metierName as string;
                userValue.currentUser.interests=requestBody.about_me
              }
          requestBody.about_me = "";
          localStorage.removeItem("about_me");
          
          setRequestAboutMeSuccess(true)
            }
        }else{
      setRequestAboutMeFail(true)
  }
      } catch (err) {
        setRequestAboutMeFail(true)
        console.log(err, "handleRequestSubmit aboutMe")
      }
    }

  function handleInfoInput() {
    if (requestBody.about_me.length > 5) {
      setButtonActive(true)
    } else setButtonActive(false)
  }

  return (
    <div className="bg-light-gray-1 dark:bg-light-gray-black rounded-[16px] w-[360px] h-fit flex flex-col items-center justify-start overflow-x-hidden">
      <div className="flex items-center mb-[4px] bg-light-gray-white dark:bg-light-gray-7-logo dark:text-light-gray-1 w-[360px] rounded-b-2xl h-[60px]">
        <button onClick={()=>onClose(false)} className="mr-2">
          <RightArrowIcon className='rotate-180 w-9 h-9 mr-[8px] dark:fill-light-gray-1 fill-light-gray-black' />
        </button>
        <h2 className='text-light-gray-black dark:text-light-gray-1'>История</h2>
      </div>
      <div className="z-[51] w-[360px] flex flex-col rounded-t-2xl bg-light-gray-white dark:bg-light-gray-7-logo"
        
      onClick={(e)=>e.stopPropagation()}>
        <Form.Root
           className=" flex flex-col items-center justify-center"
          onSubmit={e => {
            e.preventDefault();
            handleRequestSubmit()
          }}
         >
          <div  className='flex flex-col px-4'>
            <Form.Field name="about_location" className="mt-4">
              <Form.Label className="font-gerbera-sub2 text-light-gray-4 line-clamp-3 mb-1">
              Выберите ваш род деятельности
              </Form.Label>
              <Form.Control asChild>
              </Form.Control>
            </Form.Field>
            <InputOptions
                      options={metier}
                      clicked={clickedMetier}
                      setClicked={setClickedMetier}
                      choiceMade={metierName}
                      setChoiceMade={setMetierName}
                    />
              <Form.Field name="about_presence" className="mt-4">           
                <Form.Label className="font-gerbera-sub2 text-light-gray-4 line-clamp-3 dark:text-light-gray">В свободной форме поделитесь информацией о себе, всем, что посчитаете нужным. Нам интересно всё :)</Form.Label>
              <Form.Control asChild>
                <TextareaAutosize
                  maxRows={15}
                  className="w-[328px] bg-light-gray-1 min-h-[68px] rounded-2xl py-4 px-3 text-light-gray-8-text font-gerbera-sub2 focus: outline-0 mt-2
                 placeholder:text-light-gray-3 mb-2 dark:bg-light-gray-6 dark:text-light-gray-1 dark:placeholder:text-light-gray-1"
                  required
                  defaultValue={localStorage.getItem('about_me') ?? aboutMe ?? ""}
                  onChange={e => {
                   handleFormFieldChange('about_me', e.target.value);
                   handleInfoInput()
                  }}
                />
              </Form.Control>
              <Form.Message
                match={(value) => value.length < 10}
                className="font-gerbera-sub2 text-light-error-red line-clamp-3"
              >
                Сообщение слишком короткое, минимальное количество символов 10
              </Form.Message>
            </Form.Field>

          </div>
          <button className={`${buttonActive ? "btn-B-GreenDefault" : "btn-B-GreenInactive dark:bg-light-gray-5 dark:text-light-gray-4"} mt-4 mb-4 `}
            onClick={(e) => {
              if (buttonActive) {

              } else e.preventDefault();

              // if (requestSent) {
              //   e.preventDefault()
              // }
          }}
          >Сохранить</button>
        </Form.Root>
      </div>
      <ConfirmModal
        isOpen={requestAboutMeFail}
        onOpenChange={setRequestAboutMeFail}
        onConfirm={() => {setRequestAboutMeFail(false);}}
        title={<p>
          Упс, что-то пошло не так!<br />
          Попробуйте позже
        </p>}
        description=""
        confirmText="Ок"
        isSingleButton={true}
        zIndex={true}
      />
      <ConfirmModal
        isOpen={requestAboutMeSuccess}
        onOpenChange={setRequestAboutMeSuccess}
        onConfirm={() => {setRequestAboutMeSuccess(false);}}
        title={"Спасибо, что поделились!"}
        description=""
        confirmText="Ок"
        isSingleButton={true}
        zIndex={true}
      />

    </div>
  );
};

export default AboutMe;