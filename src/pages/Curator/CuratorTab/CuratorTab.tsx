import React, { useState, useContext, useEffect } from 'react';
import { getCuratorDeliveries, TCuratorDelivery, ICuratorDeliveries } from '../../../api/apiDeliveries';
import NearestDeliveryCurator from '../../../components/NearestDelivery/NearestDeliveryCurator';
import { TokenContext } from '../../../core/TokenContext';

const CuratorTab: React.FC = () => {

   const [curatorActiveDeliveries, setCuratorActiveDeliveries] = useState<TCuratorDelivery[]>([])
   const [curatorInProcessDeliveries, setCuratorInProcessDeliveries] = useState<TCuratorDelivery[]>([])

   ///// используем контекст токена
   const tokenContext = useContext(TokenContext);
   const token = tokenContext.token;
  ////// используем контекст


//// 1. запрашиваем кураторские доставки и берем активные и в процессе исполнения
async function getMyCuratorDeliveries() {
  const activeDeliveries: TCuratorDelivery[] = [];
  const inProcessDeliveries: TCuratorDelivery[] = [];
  try {
     if (token) {
       let result: ICuratorDeliveries = await getCuratorDeliveries(token);
       if (result) { 
         result['активные доставки'].forEach((i: TCuratorDelivery) => { activeDeliveries.push(i) });
         setCuratorActiveDeliveries(activeDeliveries)/// запоминаем результат
        ////////////////////////
         result['выполняются доставки'].forEach((i: TCuratorDelivery) => { inProcessDeliveries.push(i) });
         setCuratorInProcessDeliveries(inProcessDeliveries)/// запоминаем результат
         /////////////////////
       }
  }
  } catch (err) {
    console.log(err, "getMyCuratorDeliveries CuratorPage fail")
  }
}
 
    useEffect(() => {
   getMyCuratorDeliveries()
 }, [])


  return (
    <div className="flex-col bg-light-gray-1 dark:bg-light-gray-black h-screen overflow-y-auto">
      {curatorInProcessDeliveries && curatorInProcessDeliveries.length >0 ? (
        curatorInProcessDeliveries.sort((a, b) => { return +(new Date(a.id_delivery)) - +(new Date(b.id_delivery)) }).map((del, index) => {
            return(<div key={index}>
              <NearestDeliveryCurator curatorDelivery={del} deliveryFilter='active' />
            </div>)
        })
      ) : ("")}
      {curatorActiveDeliveries && curatorActiveDeliveries.length >0 ? (
        curatorActiveDeliveries.sort((a, b) => { return +(new Date(a.id_delivery)) - +(new Date(b.id_delivery)) }).map((del, index) => {
          return (<div key={index}>
            <NearestDeliveryCurator curatorDelivery={del} deliveryFilter='nearest' />
          </div>)
        })
      ) : ("")}
 
    </div>
  );
};

export default CuratorTab;
