import React, { useState, useEffect, useContext } from 'react';
import SliderStories from '../../../components/SliderStories/SliderStories';
import Calendar from '../../../components/Calendar/Calendar';
import SliderCards from '../../../components/SliderCards/SliderCards';
import DeliveryType from '../../../components/ui/Hr/DeliveryType';
import DeliveryInfo from '../../../components/ui/Hr/DeliveryInfo';
import RouteSheets from '../../../components/RouteSheets/RouteSheets';
import Search from '../../../components/Search/Search';
import { IUser } from '../../../core/types';
import avatar1 from '../../../assets/avatar.svg';
import { DeliveryContext } from '../../../core/DeliveryContext';

const users: IUser[] = [
  {
    id: 1,
    tg_id: 1,
    name: 'Василий',
    last_name: 'Петров',
    is_adult: true,
    avatar: avatar1,
    is_staff: true,
    rating: {
      id: 0,
      level: '',
      hours_needed: 0,
    },
    point: 0,
    volunteer_hour: 0,
  },
  {
    id: 2,
    tg_id: 2,
    name: 'Анна',
    last_name: 'Иванова',
    is_adult: true,
    avatar: avatar1,
    is_staff: true,
    rating: {
      id: 0,
      level: '',
      hours_needed: 0,
    },
    point: 0,
    volunteer_hour: 0,
  },
];

interface RouteSheet {
  id: number;
  title: string;
}

const MainPageCurator: React.FC = () => {
  const { deliveries, isLoading, fetchDeliveries } =
    useContext(DeliveryContext);
  const [currentDelivery, setCurrentDelivery] = useState<any>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<
    'Активная' | 'Ближайшая' | 'Завершена'
  >('Ближайшая');
  const [isRouteSheetsOpen, setIsRouteSheetsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const points = 5;

  // Данные маршрутных листов (замените на реальные данные)
  const routeSheetsData: RouteSheet[] = [
    { id: 1, title: 'Маршрутный лист 1' },
    { id: 2, title: 'Маршрутный лист 2' },
    { id: 3, title: 'Маршрутный лист 3' },
    { id: 4, title: 'Маршрутный лист 4' },
  ];

  // Состояние завершенных маршрутных листов
  const [completedRouteSheets, setCompletedRouteSheets] = useState<boolean[]>(
    Array(routeSheetsData.length).fill(false),
  );

  // Обработчик для открытия маршрутных листов
  const openRouteSheets = () => {
    setIsRouteSheetsOpen(true);
  };

  const closeRouteSheets = () => {
    setIsRouteSheetsOpen(false);
  };

  const handleUserClick = (user: IUser) => {
    console.log('Selected user:', user);
  };

  // Вычисление статуса доставки на основе данных из API
  const computeStatus = (delivery: any) => {
    if (!delivery || !delivery.date) return 'Ближайшая'; // Проверка на наличие даты

    const today = new Date();
    const deliveryDate = new Date(delivery.date);

    if (delivery.is_completed) {
      return 'Завершена';
    } else if (deliveryDate.toDateString() === today.toDateString()) {
      return 'Активная'; // Если доставка начинается сегодня, она активна
    } else {
      return 'Ближайшая'; // Если доставка еще не началась
    }
  };

  // Функция для поиска ближайшей доставки
  const getNearestDelivery = (deliveries: any[]) => {
    const today = new Date();

    // Фильтруем и сортируем доставки по дате
    const upcomingDeliveries = deliveries
      .filter(d => d.date && new Date(d.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (upcomingDeliveries.length > 0) {
      return upcomingDeliveries[0]; // Берем ближайшую доставку
    }
    return null;
  };

  useEffect(() => {
    fetchDeliveries(); // Загружаем доставки при монтировании компонента
  }, [fetchDeliveries]);

  useEffect(() => {
    if (!isLoading && deliveries.length > 0) {
      const nearestDelivery = getNearestDelivery(deliveries); // Ищем ближайшую доставку
      setCurrentDelivery(nearestDelivery); // Устанавливаем текущую доставку
      setDeliveryStatus(computeStatus(nearestDelivery)); // Вычисляем статус текущей доставки
    }
  }, [isLoading, deliveries]);

  if (isLoading || !currentDelivery) {
    return <div>Загрузка доставок...</div>;
  }

  return (
    <div className="flex-col bg-light-gray-1 min-h-[746px]">
      <SliderStories />
      <div className="flex-col bg-light-gray-white rounded-[16px]">
        <DeliveryType
          status={deliveryStatus}
          points={points}
          onDeliveryClick={openRouteSheets} // Открытие маршрутных листов
        />
        <Search
          showSearchInput={false}
          showInfoSection={true}
          users={users}
          onUserClick={handleUserClick}
        />

        {deliveryStatus === 'Ближайшая' && (
          <div>
            <DeliveryInfo />
          </div>
        )}

        {!isRouteSheetsOpen && (
          <Calendar
            headerName="Расписание доставок"
            showHeader={true}
            showFilterButton={false}
            showDatePickerButton={false}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        )}
      </div>
      {!isRouteSheetsOpen && (
        <>
          <SliderCards showTitle={false} />
          <SliderCards showTitle={true} />
        </>
      )}
      {isRouteSheetsOpen && (
        <RouteSheets
          status={deliveryStatus}
          onClose={closeRouteSheets} // Закрытие маршрутных листов
          routeSheetsData={routeSheetsData} // Передача данных о маршрутных листах
          completedRouteSheets={completedRouteSheets} // Состояние завершенных маршрутов
          setCompletedRouteSheets={setCompletedRouteSheets} // Функция для обновления завершенных маршрутов
        />
      )}
    </div>
  );
};

export default MainPageCurator;
