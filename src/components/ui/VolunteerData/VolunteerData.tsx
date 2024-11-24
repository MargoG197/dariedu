import React, { useState, useContext } from 'react';
import GeoIcon from '../../../assets/icons/geo.svg?react';
import EmailIcon from '../../../assets/icons/email.svg?react';
import BirthdayIcon from '../../../assets/icons/birthday.svg?react';
import PhoneIcon from '../../../assets/icons/phone.svg?react';
import TelegramIcon from '../../../assets/icons/telegram.svg?react';
import Big_pencilIcon from '../../../assets/icons/big_pencil.svg?react';
import { UserContext } from '../../../core/UserContext';
import { patchUser} from '../../../api/userApi';
import { TokenContext } from '../../../core/TokenContext';
import ConfirmModal from '../ConfirmModal/ConfirmModal';

interface IVolunteerDataProps {
  geo: string;
  email: string;
  birthday: string;
  phone: string;
  telegram: string;
}

export const VolunteerData: React.FC<IVolunteerDataProps> = ({
  geo,
  email,
  phone,
  telegram,
}) => {
  const { currentUser } = useContext(UserContext);
  const { token } = useContext(TokenContext)
  const [nik, setNik] = useState<string>('');
  const [confirmUpdate, setConfirmUpdate] = useState(false);
  const [updateDataSuccess, setUpdateDataSuccess] = useState(false);
  const [updateDataFail, setUpdateDataFail] = useState(false);

  if (!currentUser) {
    return <div>Пользователь не найден</div>;
  }

  const birthdayFormatted = currentUser.birthday
    ? new Date(currentUser.birthday).toLocaleDateString()
    : 'Дата рождения не указана';

  const [formData, setFormData] = useState({
    geo,
    email,
    birthday: birthdayFormatted,
    phone,
    telegram
  });

  const [isEditing, setIsEditing] = useState({
    geo: false,
    email: false,
    birthday: false,
    phone: false,
    telegram:false
  });

  // Обработчик для изменения значений полей
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof typeof formData,
  ) => {
    setFormData({
      ...formData,
      [field]: e.target.value,
    });
  };

  // Функция для переключения режима редактирования
  const toggleEdit = (field: keyof typeof isEditing) => {
    setIsEditing(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Функция для отправки обновленных данных на сервер
  const handleSave = async (field: keyof typeof formData) => {
    if (!currentUser || !token) return;

    try {
      // Отправляем обновленные данные на бэкенд
      const updatedUser = await patchUser(
        currentUser.id,
        {
          [field]: formData[field],
        },
        token,
      );

      console.log('Пользователь успешно обновлен:', updatedUser);

      // Выключаем режим редактирования
      setIsEditing(prev => ({
        ...prev,
        [field]: false,
      }));
    } catch (error) {
      console.error('Ошибка при обновлении пользователя:', error);
    }
  };
  const handleSaveTelegramNik = async (data:string) => {
    if (!currentUser || !token) return;
    try {
      // Отправляем обновленные данные на бэкенд
      const updatedUser = await patchUser(
        currentUser.id,
        {
          [telegram]: data,
        },
        token,
      );
      if (updatedUser) {
        setUpdateDataSuccess(true)
      }
    } catch (error) {
      setUpdateDataFail(true)
      console.error('Ошибка при обновлении пользователя:', error);
    }
  };

  const items = [
    formData.geo,
    formData.email,
    formData.birthday,
    formData.phone,
    telegram,
  ];
  const iconsLinks = [
    <GeoIcon className="w-[42px] h-[42px] dark:fill-light-gray-1 rounded-full dark:bg-light-gray-6 bg-light-gray-1 fill-light-gray-black" />,
    <EmailIcon className="w-[42px] h-[42px] dark:fill-light-gray-1 rounded-full dark:bg-light-gray-6 bg-light-gray-1 fill-light-gray-black" />,
    <BirthdayIcon className="w-[42px] h-[42px] dark:fill-light-gray-1 rounded-full dark:bg-light-gray-6 bg-light-gray-1 fill-light-gray-black" />,
    <PhoneIcon className="w-[42px] h-[42px] dark:fill-light-gray-1 rounded-full dark:bg-light-gray-6 bg-light-gray-1 fill-light-gray-black" />,
    <TelegramIcon className="w-[42px] h-[42px] dark:fill-light-gray-1 rounded-full dark:bg-light-gray-6 bg-light-gray-1 fill-light-gray-black" />,
  ];

  function updatePhone() {
    Telegram.WebApp.sendData('/update_phone_number')
    console.log( '/update_phone_number')
  }
  function updateTelegram() {
    if (window.Telegram?.WebApp?.initDataUnsafe) {
      const initData = window.Telegram.WebApp.initDataUnsafe;
      const tgNik = initData.user?.username
      const tgNikName = initData.user?.name
      console.log("tgNik", initData.user?.username)
      console.log("tgNikName", tgNikName)
      if (tgNik) {
        setNik(tgNik);
        setConfirmUpdate(true)
      } else {
        setUpdateDataFail(true)
        console.log("Ник не был предоставлен приложением")
      }
    }
  }



  return (
    <div className="w-[360px] h-[410px] bg-light-gray-white dark:bg-light-gray-7-logo flex flex-col justify-between mt-1 rounded-2xl">
      {items.map((_, index) => {
        const field = Object.keys(isEditing)[index] as keyof typeof formData;
       // Если это поле telegram (последний элемент), не делаем его редактируемым
        if (index === 4 || index === 3) {
          return (
            <div
              className="w-[360px] h-[66px] flex items-center justify-between px-3.5"
              key={index}
            >
              <div className="inline-flex items-center justify-start">
                {iconsLinks[index]}
                <p className="ml-3.5 dark:text-light-gray-1">
                    {formData[field]}
                  </p>
              </div>
              <Big_pencilIcon
                className="w-[42px] h-[42px] cursor-pointer fill-[#0A0A0A] bg-light-gray-1 rounded-full dark:fill-[#F8F8F8] dark:bg-light-gray-6"
                onClick={() => {index == 3 ? updatePhone() : updateTelegram()}}
              />
            </div>
          );
        } else {
          return (
            <div
              className="w-[360px] h-[66px] flex items-center justify-between px-3.5"
              key={index}
            >
              <div className="inline-flex items-center justify-start">
                {iconsLinks[index]}
                {isEditing[field] ? (
                  <input
                    className="ml-3.5 p-1 border rounded"
                    value={formData[field]}
                    onChange={e => handleInputChange(e, field)}
                    onBlur={() => handleSave(field)}
                  />
                ) : (
                  <p className="ml-3.5 dark:text-light-gray-1">
                    {formData[field]}
                  </p>
                )}
              </div>
              <Big_pencilIcon
                className="w-[42px] h-[42px] cursor-pointer fill-[#0A0A0A] bg-light-gray-1 rounded-full dark:fill-[#F8F8F8] dark:bg-light-gray-6"
                onClick={() => toggleEdit(field)}
              />
            </div>
          );
        }
      })}
      {nik && 
       <ConfirmModal
       isOpen={confirmUpdate}
       onOpenChange={setConfirmUpdate}
        onConfirm={() => { handleSaveTelegramNik(nik); setConfirmUpdate(false) }}
        onCancel={() => setConfirmUpdate(false)}
       title={
         <p>
           Ваш новый телеграм ник: ${nik}.
           <br /> Обновить?
         </p>
       }
       description=""
        confirmText="Обновить"
        cancelText='Закрыть'
        isSingleButton={false}
        zIndex={true}
        />}
      <ConfirmModal
       isOpen={updateDataSuccess}
       onOpenChange={setUpdateDataSuccess}
        onConfirm={() => {setUpdateDataSuccess(false) }}
       title="Отлчино, данные обновлены!"
       description=""
       confirmText="Закрыть"
        isSingleButton={true}
        zIndex={true}
      />
      <ConfirmModal
       isOpen={updateDataFail}
       onOpenChange={setUpdateDataFail}
        onConfirm={() => {setUpdateDataFail(false) }}
       title={
         <p>
           Упс, что-то пошло не так!
           <br /> Попробуйте позже.
         </p>
       }
       description=""
       confirmText="Закрыть"
        isSingleButton={true}
        zIndex={true}
     />
       
    </div>
  );
};
