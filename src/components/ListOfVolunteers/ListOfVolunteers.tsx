import React, {useState, useContext} from 'react';
import * as Avatar from '@radix-ui/react-avatar';
import { TVolunteerForDeliveryAssignments } from './../../api/apiDeliveries'
import Small_sms from "./../../assets/icons/small_sms.svg?react";
import ConfirmModal from '../ui/ConfirmModal/ConfirmModal';
import {
  postDeliveryTake,
  type IDelivery, getDeliveryById
} from '../../api/apiDeliveries';
import { UserContext } from '../../core/UserContext';
import { getMetroCorrectName, getMonthCorrectEndingName } from '../helperFunctions/helperFunctions';


interface ListOfVolunteersProps {
  listOfVolunteers: TVolunteerForDeliveryAssignments[]
 // changeListOfVolunteers: React.Dispatch<React.SetStateAction<TVolunteerForDeliveryAssignments[]>>
  onOpenChange:React.Dispatch<React.SetStateAction<boolean>>
  showActions?: boolean; // Добавляем пропс для контроля видимости кнопок
  deliveryId?: number
  routeSheetId?: number
  routeSheetName?: string
  onVolunteerAssign?: (volunteerId: number, deliveryId: number, routeSheetId: number) => {}
  assignVolunteerFail?: boolean
  assignVolunteerSuccess?: boolean
  setAssignVolunteerSuccess?: React.Dispatch<React.SetStateAction<boolean>>
  setAssignVolunteerFail?:React.Dispatch<React.SetStateAction<boolean>>
}

const ListOfVolunteers: React.FC<ListOfVolunteersProps> = ({
  listOfVolunteers,
  //changeListOfVolunteers,
  onOpenChange,
  showActions,
  deliveryId,
  routeSheetId,
  routeSheetName,
  onVolunteerAssign,
  assignVolunteerFail,
  assignVolunteerSuccess,
  setAssignVolunteerFail,
  setAssignVolunteerSuccess
}) => {
  const [volunteerClicked, setVolunteerClicked] = useState(false);
  const [volunteerId, setVolunteerId] = useState<number>();
  const [volunteerName, setVolunteerName]= useState<string>('')
  // const [listOfVolunteersThisPage, setListOfVolunteersThisPage] = useState<TVolunteerForDeliveryAssignments[]>(listOfVolunteers)
  
  const [takeDeliverySuccess, setTakeDeliverySuccess] =
  useState<boolean>(false); //// подтверждение бронирования доставки
const [takeDeliverySuccessDateName, setTakeDeliverySuccessDateName] =
  useState<string>(''); ///строка для вывова названия и времени доставки в алерт
const [takeDeliveryFail, setTakeDeliveryFail] = useState<boolean>(false); /// переменная для записи если произошла ошибка  при взятии доставки
const [takeDeliveryFailString, setTakeDeliveryFailString] =
  useState<string>(''); //переменная для записи названия ошибки при взятии доставки
     
  const userValue = useContext(UserContext);
  const currentUser = userValue.currentUser;
  const token = userValue.token;

  ////функция чтобы волонтер взял доставку
    async function getDelivery(delivery: IDelivery) {
      const id: number = delivery.id;
      const deliveryDate = new Date(delivery.date);
      const date = deliveryDate.getDate();
      const month = getMonthCorrectEndingName(deliveryDate);
      const hours =
        deliveryDate.getHours() < 10
          ? '0' + deliveryDate.getHours()
          : deliveryDate.getHours();
      const minutes =
        deliveryDate.getMinutes() < 10
          ? '0' + deliveryDate.getMinutes()
          : deliveryDate.getMinutes();
      const subway = getMetroCorrectName(delivery.location.subway);
      const finalString = `м. ${subway}, ${date} ${month}, ${hours}:${minutes}`;
      try {
        if (token) {
        let result: IDelivery = await postDeliveryTake(token, id, delivery);
          if (result) {
            setTakeDeliverySuccess(true);
            setTakeDeliverySuccessDateName(finalString);
            let list: TVolunteerForDeliveryAssignments[] = [];
            listOfVolunteers.forEach(i => list.push(i));
          if (currentUser && currentUser.tg_username && currentUser.last_name && currentUser.name && currentUser.photo) {
            list.push({
            id: currentUser.id,
            tg_username: currentUser.tg_username,
            last_name: currentUser.last_name,
            name: currentUser.name,
            photo: currentUser.photo
            })
            console.log({
              id: currentUser.id,
              tg_username: currentUser.tg_username,
              last_name: currentUser.last_name,
              name: currentUser.name,
              photo: currentUser.photo
              })
          }
        //changeListOfVolunteers(list)
          }
        }
      } catch (err) {
        if (err == 'Error: You have already taken this delivery') {
          setTakeDeliveryFail(true);
          setTakeDeliveryFailString(
            `Ошибка, ${finalString} доставка, уже у вас в календаре`,
          );
        } else {
          setTakeDeliveryFail(true);
          setTakeDeliveryFailString(`Упс, что то пошло не так, попробуйте позже`);
        }
      }
    }

  
  
    async function getDeliveryId(deliveryId: number) {
      if (token) {
        try {
          let result: IDelivery = await getDeliveryById(token, deliveryId);
      if (result) {
        getDelivery(result)
      }
        } catch (err) {
          console.log(err, "getDeliveryId, ListOfVolunteers")
        }
      }
    }

  return (
    <div className={showActions? "space-y-4 w-[360px] pt-10 pb-5 rounded-[16px] flex flex-col items-center mt-3 bg-light-gray-white dark:bg-light-gray-7-logo" : "w-[310px] rounded-[16px] flex flex-col items-center mt-3 space-y-4 "} onClick={e => {e.stopPropagation() }
}>
        {/* Список волонтёров */}
      {listOfVolunteers.map((volunteer, index) => (
        <div
          key={index}
          className={showActions? "flex items-center justify-between space-x-4 p-4 bg-light-gray-1 dark:bg-light-gray-6 rounded-[16px] shadow cursor-pointer w-[328px]": "flex items-center justify-between space-x-4 p-4 bg-light-gray-1 dark:bg-light-gray-6 rounded-[16px] shadow cursor-pointer w-[310px]" } 
          onClick={(e) => {
            e.stopPropagation();
            setVolunteerId(volunteer.id)
            setVolunteerName(`${volunteer.name} ${volunteer.last_name}`)
            setVolunteerClicked(true)
          }
          }
        >
           {/* Аватарка */}
           <div className='flex w-fit items-center'>
           <Avatar.Root className="inline-flex items-center justify-center align-middle overflow-hidden w-8 h-8 rounded-full bg-light-gray-2 dark:bg-light-gray-5">
            {/* <Avatar.Image
              className="w-full h-full object-cover"
              src={volunteer.photo}
            /> */}
            <Avatar.Fallback
              className="w-full h-full flex items-center justify-center text-white bg-black"
              delayMs={600}
            >
              {volunteer.name?.charAt(0)}
            </Avatar.Fallback>
          </Avatar.Root>
          {/* Имя волонтера */}
          <span className="font-gerbera-h3 text-light-gray-8-text dark:text-light-gray-1  ml-[10px]">
            {`${volunteer.last_name} ${volunteer.name}`}
           </span>
         </div>
          
           {volunteer.tg_username ?  (
                  <a href={'https://t.me/' + (volunteer.tg_username.includes('@')? volunteer.tg_username.slice(1): volunteer.tg_username)} target="_blank" onClick={(e=>e.stopPropagation())}>
                    <Small_sms className="w-[36px] h-[35px]"/>
             </a>
               ) : ""} 
        </div>
       ))}  
        {/* Действия кнопок */}
      {showActions && (
        <div className="flex justify-between mt-4 w-[328px]">
            <button
              className={'btn-M-GreenDefault'}
            onClick={()=>onOpenChange(false)}
          >
            Закрыть
          </button>
          <button
            className={'btn-M-GreenClicked'}
            onClick={() => { deliveryId ? getDeliveryId(deliveryId) : ()=>{}}}
          >
            Забрать себе
          </button>
        </div>
      )}
      {/* </div> */}
      {onVolunteerAssign && volunteerId && deliveryId && routeSheetId ? (
  <ConfirmModal
  isOpen={volunteerClicked}
  onOpenChange={setVolunteerClicked}
  onConfirm={() => { onVolunteerAssign(volunteerId, deliveryId, routeSheetId); setVolunteerClicked(false) }}
  onCancel={()=>setVolunteerClicked(false)}
  title={`Назначить волонтера ${volunteerName} на ${routeSheetName}?`}
  description=""
  confirmText="Назначить"
  isSingleButton={false}
/>
      ) : ("")}
      {onVolunteerAssign && assignVolunteerFail && setAssignVolunteerFail ? (
        <>
      <ConfirmModal
      isOpen={assignVolunteerFail}
      onOpenChange={setAssignVolunteerFail}
        onConfirm = {() => {setAssignVolunteerFail(false)}}
      title={
        <p>
          Упс, что-то пошло не так<br />
          Попробуйте позже
        </p>
      }
      description=""
      confirmText="Ок"
      isSingleButton={true}
    />
        </>
      ) : ("")}
      {onVolunteerAssign  && assignVolunteerSuccess && setAssignVolunteerSuccess ? (
        <>
        <ConfirmModal
      isOpen={assignVolunteerSuccess}
      onOpenChange={setAssignVolunteerSuccess}
        onConfirm = {() => {setAssignVolunteerSuccess(false)}}
      title={
        <p>
        Волонтер успешно назначен на доставку!
        </p>
      }
      description=""
      confirmText="Ок"
      isSingleButton={true}
          />
        </>
      ) : ("")}
       <ConfirmModal
        isOpen={takeDeliverySuccess}
        onOpenChange={setTakeDeliverySuccess}
        onConfirm={() => {
          setTakeDeliverySuccess(false);
        }}
        title={`Доставка ${takeDeliverySuccessDateName} в календаре, теперь вы можете назначить смаршрутный лист`}
        description=""
        confirmText="Ок"
        isSingleButton={true}
      />
      <ConfirmModal
        isOpen={takeDeliveryFail}
        onOpenChange={setTakeDeliveryFail}
        onConfirm={() => {
          setTakeDeliveryFail(false);
          setTakeDeliveryFailString('');
        }}
        title={takeDeliveryFailString}
        description=""
        confirmText="Ок"
        isSingleButton={true}
      />
      </div> 
  );
};

export default ListOfVolunteers;
