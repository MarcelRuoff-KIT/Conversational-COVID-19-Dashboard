import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { param } from 'jquery';

@Injectable()
export class DrillDownService  {

  public x = 0;
  public y = 0;
  public scale = 0;
  public date;
  public tab;

  public countiesMapped = [
    {
      "x": -868.4589239659974,
      "y": -536.0123620913591,
      "scale": 8,
      "State": "Washington"
    },
    {
      "x": -491.43069161196763,
      "y": -615.2136080575572,
      "scale": 6.068105828821568,
      "State": "Oregon"
    },
    {
      "x": -21.71886321305749,
      "y": -450.4210275514805,
      "scale": 2.958376198359591,
      "State": "California"
    },
    {
      "x": -307.51435258613424,
      "y": -687.6225086899302,
      "scale": 4.130014819015394,
      "State": "Nevada"
    },
    {
      "x": -481.2145893678613,
      "y": -330.22821398603696,
      "scale": 4.209574969229885,
      "State": "Idaho"
    },
    {
      "x": -1166.4265334404865,
      "y": -490.13799975931863,
      "scale": 6.0541794755024725,
      "State": "Montana"
    },
    {
      "x": -1499.39963281725,
      "y": -1022.9234971509231,
      "scale": 6.999849828971005,
      "State": "Wyoming"
    },
    {
      "x": -884.337320631204,
      "y": -1046.7456042378087,
      "scale": 5.761613154691734,
      "State": "Utah"
    },
    {
      "x": -669.7023195563975,
      "y": -1279.9139156147303,
      "scale": 5.114967356328304,
      "State": "Arizona"
    },
    {
      "x": -1136.3505236246222,
      "y": -1455.2033950319583,
      "scale": 5.604326589599097,
      "State": "New Mexico"
    },
    {
      "x": -1621.166475965683,
      "y": -1447.4985156850112,
      "scale": 7.069524355330066,
      "State": "Colorado"
    },
    {
      "x": -2377.441971247872,
      "y": -754.5750816836658,
      "scale": 8,
      "State": "North Dakota"
    },
    {
      "x": -2367.4742551474524,
      "y": -1116.5536319338953,
      "scale": 8,
      "State": "South Dakota"
    },
    {
      "x": -2225.01191374641,
      "y": -1312.5718588178486,
      "scale": 7.483012596085941,
      "State": "Nebraska"
    },
    {
      "x": -2173.448192212128,
      "y": -1871.6806437335713,
      "scale": 7.163643854574927,
      "State": "Oklahoma"
    },
    {
      "x": -2506.133859759394,
      "y": -1764.0214507924416,
      "scale": 8,
      "State": "Kansas"
    },
    {
      "x": -627.1040986261547,
      "y": -802.2429494762607,
      "scale": 2.97447199477294,
      "State": "Texas"
    },
    {
      "x": -1877.9876257335704,
      "y": -527.7478385015577,
      "scale": 5.496269979692641,
      "State": "Minnesota"
    },
    {
      "x": -2927.3055752760374,
      "y": -1375.6946352531495,
      "scale": 8,
      "State": "Iowa"
    },
    {
      "x": -2601.8632896031195,
      "y": -1530.587796357272,
      "scale": 7.006372481199913,
      "State": "Missouri"
    },
    {
      "x": -3053.8059984560173,
      "y": -2185.606168192233,
      "scale": 8,
      "State": "Arkansas"
    },
    {
      "x": -3144.1120337202883,
      "y": -2598.918224844432,
      "scale": 8,
      "State": "Louisiana"
    },
    {
      "x": -2626.9623126629735,
      "y": -1935.096892539129,
      "scale": 6.564130643056938,
      "State": "Mississippi"
    },
    {
      "x": -3244.704340300331,
      "y": -1817.8176963531478,
      "scale": 7.279496500202008,
      "State": "Tennessee"
    },
    {
      "x": -3617.3571095231528,
      "y": -1811.3879166199313,
      "scale": 8,
      "State": "Kentucky"
    },
    {
      "x": -2234.2048386637257,
      "y": -1081.4288945101332,
      "scale": 5.7331517995048795,
      "State": "Illinois"
    },
    {
      "x": -2855.2776555290934,
      "y": -939.1857399362075,
      "scale": 7.2587329184903195,
      "State": "Wisconsin"
    },
    {
      "x": -2091.6541888878123,
      "y": -562.3331088209824,
      "scale": 5.126608165427977,
      "State": "Michigan"
    },
    {
      "x": -3360.0484412383153,
      "y": -1502.6916936106413,
      "scale": 7.634095086473216,
      "State": "Indiana"
    },
    {
      "x": -3821.6614426148935,
      "y": -1488.2275622487386,
      "scale": 8,
      "State": "Ohio"
    },
    {
      "x": -2876.839584527265,
      "y": -1917.8955655254413,
      "scale": 6.565002280887439,
      "State": "Alabama"
    },
    {
      "x": -2763.7454502820046,
      "y": -2015.9087442711707,
      "scale": 5.858284817618313,
      "State": "Florida"
    },
    {
      "x": -3432.2263831713635,
      "y": -2061.6287288116196,
      "scale": 7.139706105804315,
      "State": "Georgia"
    },
    {
      "x": -4086.076978967003,
      "y": -2216.180389582726,
      "scale": 8,
      "State": "South Carolina"
    },
    {
      "x": -3728.2082440118147,
      "y": -1771.5943211148167,
      "scale": 7.26336495317983,
      "State": "North Carolina"
    },
    {
      "x": -4037.039605158244,
      "y": -1669.032366161746,
      "scale": 7.792290971916693,
      "State": "Virginia"
    },
    {
      "x": -4068.2883904691253,
      "y": -1625.1093712358968,
      "scale": 8,
      "State": "West Virginia"
    },
    {
      "x": -4311.682777610637,
      "y": -1553.4339481207285,
      "scale": 8,
      "State": "Maryland"
    },
    {
      "x": -4236.959236280902,
      "y": -1361.0168584241837,
      "scale": 8,
      "State": "Pennsylvania"
    },
    {
      "x": -4465.859334905241,
      "y": -1513.2809391659457,
      "scale": 8,
      "State": "Delaware"
    },
    {
      "x": -4499.463815190882,
      "y": -1383.534425252104,
      "scale": 8,
      "State": "New Jersey"
    },
    {
      "x": -3894.2399377100082,
      "y": -946.5589241097716,
      "scale": 7.208116938393932,
      "State": "New York"
    },
    {
      "x": -4625.193857594659,
      "y": -1198.4859560718132,
      "scale": 8,
      "State": "Connecticut"
    },
    {
      "x": -4719.28645800684,
      "y": -1158.03513348357,
      "scale": 8,
      "State": "Rhode Island"
    },
    {
      "x": -4692.497679558311,
      "y": -1088.2870019077313,
      "scale": 8,
      "State": "Massachusetts"
    },
    {
      "x": -4668.066825716087,
      "y": -906.2485314601263,
      "scale": 8,
      "State": "New Hampshire"
    },
    {
      "x": -4556.882506412917,
      "y": -933.2665278905051,
      "scale": 8,
      "State": "Vermont"
    },
    {
      "x": -4151.058038805579,
      "y": -605.818127629716,
      "scale": 6.985487171819148,
      "State": "Maine"
    },
    {
      "x": -1635.4832916943124,
      "y": -3031.616493818463,
      "scale": 8,
      "State": "Hawaii"
    },
    {
      "x": -154.5332641430432,
      "y": -1423.4258900124978,
      "scale": 4.278604660744669,
      "State": "Alaska"
    }
  ]
  
  
  //[{"x": -850.3577045178033, "y": -151.05505169722517, "scale": 6.649404482685333, "State": "Washington"}, {"x": -415.7031149272542, "y": -311.80831661647915, "scale": 4.854484663057255, "State": "Oregon"}, {"x": 66.4476319935041, "y": -302.502217633501, "scale": 2.3667009586876726, "State": "California"}, {"x": -224.0344118621956, "y": -481.1217677391601, "scale": 3.304011855212314, "State": "Nevada"}, {"x": -196.07855522323837, "y": -1538.7027280511045, "scale": 4.1949569591934, "State": "Alaska"}, {"x": -2041.6660767265062, "y": -3298.978684258036, "scale": 7.882195159548647, "State": "Hawaii"}, {"x": -590.1621889817111, "y": -1024.1655477983154, "scale": 4.091973885062644, "State": "Arizona"},{"x": -807.383773249971, "y": -758.664946503222, "scale": 4.609290523753387, "State": "Utah"}, {"x": -398.0528892447817, "y": -119.74946552454321, "scale": 3.3676599753839107, "State": "Idaho"}, {"x": -1145.6979748642486, "y": -202.7619375574405, "scale": 5.013114113278854, "State": "Montana"}, {"x": -1427.3990321331332, "y": -672.9310057023724, "scale": 5.599879863176801, "State": "Wyoming"}, {"x": -1549.444573387005, "y": -1094.0222979185091, "scale": 5.655619484264058, "State": "Colorado"}, {"x": -1058.7678299830184, "y": -1174.9870655520033, "scale": 4.4834612716792765, "State": "New Mexico"}, {"x": -539.001986605247, "y": -653.5193497376141, "scale": 2.379577595818353, "State": "Texas"}, {"x": -2759.5310702615275, "y": -1962.5021885286505, "scale": 7.190061413234994, "State": "Oklahoma"}, {"x": -3167.6673246992423, "y": -1767.5268134905518, "scale": 8, "State": "Kansas"}, {"x": -2848.350270480951, "y": -1251.1636577013278, "scale": 7.561781149728949, "State": "Nebraska"}, {"x": -2544.2368921521697, "y": -801.6690868874709, "scale": 6.963588913957071, "State": "South Dakota"}, {"x": -2954.0951177636603, "y": -494.2952238230848, "scale": 7.8790700721604745, "State": "North Dakota"}, {"x": -1799.9727056523388, "y": -252.93433951692515, "scale": 4.397015983754108, "State": "Minnesota"}, {"x": -3694.1319690950468, "y": -1282.118294066437, "scale": 8, "State": "Iowa"}, {"x": -3363.457711522657, "y": -2007.4160897196602, "scale": 7.097376299972713, "State": "Arkansas"}, {"x": -2529.88877952792, "y": -1180.2691722972768, "scale": 5.605097984959931, "State": "Missouri"}, {"x": -3187.9974630351044, "y": -2275.9681783738624, "scale": 6.601362257663659, "State": "Louisiana"}, {"x": -2553.2188352351995, "y": -1606.8903603862811, "scale": 5.251304514445548, "State": "Mississippi"}, {"x": -4135.354517433016, "y": -1902.2225743280587, "scale": 7.3561227791515, "State": "Tennessee"}, {"x": -4556.696386903941, "y": -1826.734895774914, "scale": 8, "State": "Kentucky"}, {"x": -2157.137445861743, "y": -794.7713045348885, "scale": 4.586521439603899, "State": "Illinois"}, {"x": -2784.3125872030605, "y": -576.2490940116928, "scale": 5.806986334792266, "State": "Wisconsin"}, {"x": -2012.1606215495235, "y": -306.00270054958355, "scale": 4.101286532342381, "State": "Michigan"}, {"x": -3290.5848215842075, "y": -1120.9869392869803, "scale": 6.107276069178573, "State": "Indiana"}, {"x": -2803.0995936508148, "y": -1589.6454514810696, "scale": 5.252001824709952, "State": "Alabama"}, {"x": -2687.178589552477, "y": -1722.9945033902545, "scale": 4.686627854094649, "State": "Florida"}, {"x": -3360.7852075945807, "y": -1704.6434235214047, "scale": 5.711764884643452, "State": "Georgia"}, {"x": -5142.596223708755, "y": -2332.7254869784074, "scale": 8, "State": "South Carolina"}, {"x": -4746.014783778367, "y": -1844.8539875231504, "scale": 7.339821426371208, "State": "North Carolina"}, {"x": -4765.5481988754955, "y": -1553.5652764521035, "scale": 7.351244511236118, "State": "Virginia"}, {"x": -4584.568597969923, "y": -1417.4802934616946, "scale": 7.234632283037824, "State": "West Virginia"}, {"x": -5424.603472013296, "y": -1504.292435150911, "scale": 8, "State": "Maryland"}, {"x": -5617.324168631552, "y": -1454.1011739574328, "scale": 8, "State": "Delaware"}, {"x": -5331.199045351126, "y": -1263.7710730302301, "scale": 8, "State": "Pennsylvania"}, {"x": -4029.417912559621, "y": -1175.392044706865, "scale": 6.81685936194185, "State": "Ohio"}, {"x": -5659.329768988603, "y": -1291.9180315651297, "scale": 8, "State": "New Jersey"}, {"x": -3823.072405463585, "y": -586.1530771900749, "scale": 5.766493550715145, "State": "New York"}, {"x": -5816.492321993324, "y": -1060.6074450897668, "scale": 8, "State": "Connecticut"}, {"x": -5934.10807250855, "y": -1010.0439168544626, "scale": 8, "State": "Rhode Island"}, {"x": -5900.622099447889, "y": -922.8587523846645, "scale": 8, "State": "Massachusetts"}, {"x": -5731.103133016146, "y": -729.0831598631316, "scale": 8, "State": "Vermont"}, {"x": -5870.0835321451095, "y": -695.3106643251585, "scale": 8, "State": "New Hampshire"}, {"x": -4078.9999874928562, "y": -256.54376903875885, "scale": 5.588389737455319, "State": "Maine"}]
 

  constructor(private http: HttpClient) {

  }

  public get() {
    this.http.get<any>('http://interactive-analytics.org:8080/interactions').subscribe({
        next: data => {
            console.log(data);
        },
        error: error => {
            console.log(error.message);
            console.error('There was an error!', error);
        }
    })
  }

  public post(limeID, task, treatment, interactionType, parameters, state, nl){
    var conversationID = sessionStorage.getItem('conversationID')
    //console.log(conversationID)
    var datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
    console.log({ sessionID: conversationID, limeID: limeID, task: task, treatment: treatment, interaction: interactionType , parameters: JSON.stringify(parameters), state: JSON.stringify(state),  date: datetime, naturalLanguage: nl })
    //console.log(datetime);
    /*
      this.http.post<any>('http://interactive-analytics.org:8080/interactions', { sessionID: conversationID, limeID: limeID, task: task, treatment: treatment, interaction: interactionType , parameters: JSON.stringify(parameters), state: JSON.stringify(state),  date: datetime, naturalLanguage: nl }).subscribe({
          next: data => {
              console.log(data);
          },
          error: error => {
              console.log( error.message);
              console.error('There was an error!', error);
          }
      })
      */
  }

  public postSpeech(limeID, task, treatment, speech, text){
    var conversationID = sessionStorage.getItem('conversationID')
    //console.log(conversationID)
    var datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
    //console.log(datetime);
    /*
      this.http.post<any>('http://interactive-analytics.org:8080/speech', {sessionID: conversationID, limeID: limeID, task: task, treatment: treatment, text: text, speech: speech, date: datetime}).subscribe({
          next: data => {
              console.log(data);
          },
          error: error => {
              console.log( error.message);
              console.error('There was an error!', error);
          }
      })
      */
  }

}
