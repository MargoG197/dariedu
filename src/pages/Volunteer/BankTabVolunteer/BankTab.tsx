
import React, {useState, useEffect, useContext} from 'react'
import Points from "../../../components/ui/Points/Points";
//import ActionsVolunteer from "../../../components/ActionsVolunteer/ActionsVolunteer";
import SliderCardsPromotions from "../../../components/ui/Cards/CardPromotion/SliderCardsPromotions";
import FilterPromotions from "../../../components/FilterPromotions/FilterPromotions";
import { Modal } from '../../../components/ui/Modal/Modal';
import { getAllPromotions, getPromotionsCategories, postPromotionCancel, postPromotionRedeem, type IPromotion, type TPromotionCategory} from '../../../api/apiPromotions';
import { UserContext } from '../../../core/UserContext';


const BankTab:React.FC = () => {

  const [openFilter, setOpenFilter] = useState(false);
  const [promotionsAll, setPromotionsAll] = useState<IPromotion[]>([]); //// абсолютно все доступные промоушены
  const [promotionCategory, setPpromotionCategory] = useState<TPromotionCategory[]>([]) /// запрашиваем категории промоушенов
  const [filterCategories, setFilterCategories] = useState<TPromotionCategory[]>([]) /// устанавливаем категории для фильтра

  //// функция вызывается при нажатии на фильтр
  function handleCategoryChoice(obj: TPromotionCategory) {
    let copy = Object.assign([], filterCategories);
    if (copy.includes(obj)) {
    let filtered = copy.filter(i=>{return i!=obj})
    setFilterCategories(filtered)
    } else {
      setFilterCategories([...filterCategories, obj])
    } 
  }

   ////// используем контекст юзера, чтобы вывести количество доступных баллов 
   const userValue = useContext(UserContext);
   const userPoints = userValue.currentUser?.point;
   ////// используем контекст
  
  
  async function reqAllPromotions() {
     let allPromotinsArr: IPromotion[] = [];
    try {
      allPromotinsArr = await getAllPromotions();
    } catch (err) {
      console.error(err, 'reqAllPromotions has failed, BankTab');
    } finally {
      if (allPromotinsArr.length > 0) {
        setPromotionsAll(allPromotinsArr);
      }
    }
  }
 
  async function requestPromotionsCategories() {
    let categories: TPromotionCategory[] = [];
   try {
     categories = await getPromotionsCategories();
   } catch (err) {
     console.error(err, 'requestPromotionsCategories has failed, BankTab');
   } finally {
     if (categories.length > 0) {
      setPpromotionCategory(categories);
     }
   }
 }
  /////запрашиваем города один раз при загрузке страницы
  useEffect(() => {
    reqAllPromotions();
    requestPromotionsCategories();
  }, []); 


 async function redeemPromotion(chosenId:number) {
  let promotionForReservation = promotionsAll.filter((prom) => prom.id == chosenId)
   let result: boolean = false;
   try {
     const response = await postPromotionRedeem(chosenId, promotionForReservation[0]);
     if (response) {
       result = true;
     }
   } catch (err) {
    console.error(err, 'redeemPromotion has failed, BankTab');
   } finally {
     return result
   }
  }


  async function cancelPromotion(chosenId:number) {
    let promotionForCancellation = promotionsAll.filter((prom) => prom.id == chosenId)
    let result: boolean = false;
    try {
      const response = await postPromotionCancel(chosenId, promotionForCancellation[0]);
      if (response) {
        result = true;
      }
    } catch (err) {
     console.error(err, 'cancelPromotion has failed, BankTab');
    } finally {
      return result
    }
  }


  
  return (
    <>
      <div className="mt-2 mb-4 min-h-[100vh] pb-4 overflow-y-auto">
        <div className="w-[360px] h-fit flex flex-col justify-between">
          {userPoints !== undefined || userPoints !== null ? (
          <Points points={Number(userPoints)} />
          ) : (<p className='flex items-center justify-between p-4 bg-light-gray-white dark:bg-light-gray-7-logo dark:text-light-gray-white rounded-[16px] shadow w-[360px] h-[60px]'>
              Данные по заработанным баллам временно недоступны
          </p>)}
        {/* <ActionsVolunteer visibleActions={["Пригласить друга"]} showThemeToggle={false}/> */}
        </div>

        <div className='h-[258px] bg-light-gray-white rounded-2xl mt-1 px-4 dark:bg-light-gray-7-logo ' >
          <div className='flex justify-between ml-4 mr-[14px] pt-[20px]'>
            <h1 className="font-gerbera-h1 text-light-gray-black dark:text-light-gray-white">Обменять баллы</h1>
            {promotionsAll.length == 0 || promotionCategory.length == 0 ? " " : (
              <img src='src/assets/icons/filter.svg' onClick={()=>{setOpenFilter(true)}} className='cursor-pointer'/>
            )}
          
          </div>
          {promotionsAll.length == 0 ? (<div className='flex flex-col w-[300px] items-center mt-10 h-[100px] justify-between ml-4'>
            <img src="./../src/assets/icons/LogoNoTaskYet.svg" className='w-[100px]' />
            <p>Пока нет доступных поощрений</p>
          </div>) : (
             <SliderCardsPromotions filterCategory={filterCategories} promotions={promotionsAll} optional={true} reserved={false} makeReservationFunc={redeemPromotion} /> 
          )}
        </div>
        <div className='h-[258px] bg-light-gray-white rounded-2xl mt-1 px-4  dark:bg-light-gray-7-logo' >
          <div className='flex justify-between ml-4 mr-[14px] pt-[20px]'>
            <h1 className="font-gerbera-h1 text-light-gray-black dark:text-light-gray-white">Мои планы</h1>
          </div>
          <SliderCardsPromotions promotions={promotionsAll} optional={false} reserved={true} cancelPromotion={cancelPromotion} />
        </div>
        <Modal isOpen={openFilter} onOpenChange={setOpenFilter}>
          <FilterPromotions categories={promotionCategory} onOpenChange={setOpenFilter} setFilter={setFilterCategories} filtered={filterCategories} handleCategoryChoice={handleCategoryChoice} />
        </Modal>
       </div>
    </>
  )
}

export default BankTab