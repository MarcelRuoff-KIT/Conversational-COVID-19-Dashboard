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
    {x: -205.73618706867472, y: -120.8440413577797, scale: 6.649404482685333, State: "Washington"}, {x: -8.785780244993873, y: -249.4466532931831, scale: 4.854484663057255, State: "Oregon"}, {x: 167.96098612456785, y: -242.00177410680072, scale: 2.3667009586876726, State: "California"}, {x: 14.309466348077763, y: -384.8974141913285, scale: 3.304011855212316, State: "Nevada"}, {x: -212.40394484010665, y: -819.3324382386521, scale: 4.091973885062643, State: "Arizona"}, {x: -342.72661460469226, y: -606.9319572025778, scale: 4.609290523753388, State: "Utah"}, {x: -119.55887346357639, y: -95.79957241963422, scale: 3.3676599753839076, State: "Idaho"}, {x: -538.4938226844387, y: -145.33870472436456, scale: 4.7796153753966895, State: "Montana"}, {x: -755.5293171996555, y: -538.3448045618981, scale: 5.5998798631768025, State: "Wyoming"}, {x: -848.4836220314221, y: -875.2178383348062, scale: 5.655619484264053, State: "Colorado"}, {x: -554.4035171653554, y: -939.9896524416026, scale: 4.483461271679277, State: "New Mexico"}, {x: 148.227717407787, y: -952.2334134015246, scale: 3.3778457847984233, State: "Alaska"}, {x: -1055.2284679791185, y: -2639.182947406429, scale: 7.882195159548647, State: "Hawaii"}, {x: -315.3170712354557, y: -522.8154797900911, scale: 2.3795775958183523, State: "Texas"}, {x: -1263.439487246948, y: -1192.2356192143354, scale: 5.655508306243363, State: "Oklahoma"}, {x: -1549.407083753378, y: -1128.9424810795547, scale: 6.58698795075904, State: "Kansas"}, {x: -1283.9770310996325, y: -738.2272860633302, scale: 5.907641523225743, State: "Nebraska"}, {x: -1534.4480449493387, y: -641.3352695099757, scale: 6.963588913957059, State: "South Dakota"}, {x: -1666.282182752111, y: -361.4157211354035, scale: 7.428896600527183, State: "North Dakota"}, {x: -1154.6288218865272, y: -202.3474716135405, scale: 4.3970159837541125, State: "Minnesota"}, {x: -1823.6632176398944, y: -460.9992752093533, scale: 5.806986334792256, State: "Wisconsin"}, {x: -1349.220428522859, y: -244.80216043966675, scale: 4.101286532342382, State: "Michigan"}, {x: -2367.3055752760374, y: -1025.6946352531495, scale: 8, State: "Iowa"}, {x: -1637.082792885701, y: -944.2153378378212, scale: 5.605097984959929, State: "Missouri"}, {x: -1424.4421557626683, y: -635.8170436279114, scale: 4.586521439603904, State: "Illinois"}, {x: -2178.5865600204147, y: -1605.932871775726, scale: 7.097376299972705, State: "Arkansas"}, {x: -2079.8835407843367, y: -1820.7745426990905, scale: 6.60136225766366, State: "Louisiana"}, {x: -1685.4654889747344, y: -1285.5122883090255, scale: 5.2513045144455495, State: "Mississippi"}, {x: -2101.851016013818, y: -1145.139108955037, scale: 5.74697092121211, State: "Tennessee"}, {x: -2527.334590796427, y: -1199.106312541743, scale: 6.737048216352523, State: "Kentucky"}, {x: -2734.918143644584, y: -940.3136357654926, scale: 6.816859361941855, State: "Ohio"}, {x: -2203.456667456366, y: -896.7895514295842, scale: 6.107276069178573, State: "Indiana"}, {x: -3143.945766600755, y: -1133.9842347693534, scale: 7.234632283037812, State: "West Virginia"}, {x: -3676.9592362809017, y: -1011.0168584241837, scale: 8, State: "Pennsylvania"}, {x: -2658.0724661107947, y: -468.92246175206003, scale: 5.766493550715145, State: "New York"}, {x: -3996.882506412917, y: -583.2665278905051, scale: 8, State: "Vermont"}, {x: -4108.066825716087, y: -556.2485314601263, scale: 8, State: "New Hampshire"}, {x: -2877.775252048038, y: -205.23501523100686, scale: 5.588389737455319, State: "Maine"}, {x: -4132.497679558311, y: -738.2870019077313, scale: 8, State: "Massachusetts"}, {x: -4159.28645800684, y: -808.03513348357, scale: 8, State: "Rhode Island"}, {x: -4065.1938575946588, y: -848.4859560718132, scale: 8, State: "Connecticut"}, {x: -3939.463815190882, y: -1033.534425252104, scale: 8, State: "New Jersey"}, {x: -3905.8593349052408, y: -1163.2809391659457, scale: 8, State: "Delaware"}, {x: -3751.682777610636, y: -1203.4339481207285, scale: 8, State: "Maryland"}, {x: -2694.9918374249273, y: -1007.4351191309825, scale: 6.151808662039494, State: "Virginia"}, {x: -2484.583458755866, y: -1109.283742201968, scale: 5.734235489352502, State: "North Carolina"}, {x: -3526.076978967004, y: -1866.180389582726, scale: 8, State: "South Carolina"}, {x: -2292.8399157656145, y: -1363.7147388171231, scale: 5.7117648846434514, State: "Georgia"}, {x: -1885.311521645016, y: -1271.7163611848555, scale: 5.252001824709952, State: "Alabama"}, {x: -1840.0661318980315, y: -1378.395602712204, scale: 4.68662785409465, State: "Florida"}
  ]
  
  
  //[{"x": -850.3577045178033, "y": -151.05505169722517, "scale": 6.649404482685333, "State": "Washington"}, {"x": -415.7031149272542, "y": -311.80831661647915, "scale": 4.854484663057255, "State": "Oregon"}, {"x": 66.4476319935041, "y": -302.502217633501, "scale": 2.3667009586876726, "State": "California"}, {"x": -224.0344118621956, "y": -481.1217677391601, "scale": 3.304011855212314, "State": "Nevada"}, {"x": -196.07855522323837, "y": -1538.7027280511045, "scale": 4.1949569591934, "State": "Alaska"}, {"x": -2041.6660767265062, "y": -3298.978684258036, "scale": 7.882195159548647, "State": "Hawaii"}, {"x": -590.1621889817111, "y": -1024.1655477983154, "scale": 4.091973885062644, "State": "Arizona"},{"x": -807.383773249971, "y": -758.664946503222, "scale": 4.609290523753387, "State": "Utah"}, {"x": -398.0528892447817, "y": -119.74946552454321, "scale": 3.3676599753839107, "State": "Idaho"}, {"x": -1145.6979748642486, "y": -202.7619375574405, "scale": 5.013114113278854, "State": "Montana"}, {"x": -1427.3990321331332, "y": -672.9310057023724, "scale": 5.599879863176801, "State": "Wyoming"}, {"x": -1549.444573387005, "y": -1094.0222979185091, "scale": 5.655619484264058, "State": "Colorado"}, {"x": -1058.7678299830184, "y": -1174.9870655520033, "scale": 4.4834612716792765, "State": "New Mexico"}, {"x": -539.001986605247, "y": -653.5193497376141, "scale": 2.379577595818353, "State": "Texas"}, {"x": -2759.5310702615275, "y": -1962.5021885286505, "scale": 7.190061413234994, "State": "Oklahoma"}, {"x": -3167.6673246992423, "y": -1767.5268134905518, "scale": 8, "State": "Kansas"}, {"x": -2848.350270480951, "y": -1251.1636577013278, "scale": 7.561781149728949, "State": "Nebraska"}, {"x": -2544.2368921521697, "y": -801.6690868874709, "scale": 6.963588913957071, "State": "South Dakota"}, {"x": -2954.0951177636603, "y": -494.2952238230848, "scale": 7.8790700721604745, "State": "North Dakota"}, {"x": -1799.9727056523388, "y": -252.93433951692515, "scale": 4.397015983754108, "State": "Minnesota"}, {"x": -3694.1319690950468, "y": -1282.118294066437, "scale": 8, "State": "Iowa"}, {"x": -3363.457711522657, "y": -2007.4160897196602, "scale": 7.097376299972713, "State": "Arkansas"}, {"x": -2529.88877952792, "y": -1180.2691722972768, "scale": 5.605097984959931, "State": "Missouri"}, {"x": -3187.9974630351044, "y": -2275.9681783738624, "scale": 6.601362257663659, "State": "Louisiana"}, {"x": -2553.2188352351995, "y": -1606.8903603862811, "scale": 5.251304514445548, "State": "Mississippi"}, {"x": -4135.354517433016, "y": -1902.2225743280587, "scale": 7.3561227791515, "State": "Tennessee"}, {"x": -4556.696386903941, "y": -1826.734895774914, "scale": 8, "State": "Kentucky"}, {"x": -2157.137445861743, "y": -794.7713045348885, "scale": 4.586521439603899, "State": "Illinois"}, {"x": -2784.3125872030605, "y": -576.2490940116928, "scale": 5.806986334792266, "State": "Wisconsin"}, {"x": -2012.1606215495235, "y": -306.00270054958355, "scale": 4.101286532342381, "State": "Michigan"}, {"x": -3290.5848215842075, "y": -1120.9869392869803, "scale": 6.107276069178573, "State": "Indiana"}, {"x": -2803.0995936508148, "y": -1589.6454514810696, "scale": 5.252001824709952, "State": "Alabama"}, {"x": -2687.178589552477, "y": -1722.9945033902545, "scale": 4.686627854094649, "State": "Florida"}, {"x": -3360.7852075945807, "y": -1704.6434235214047, "scale": 5.711764884643452, "State": "Georgia"}, {"x": -5142.596223708755, "y": -2332.7254869784074, "scale": 8, "State": "South Carolina"}, {"x": -4746.014783778367, "y": -1844.8539875231504, "scale": 7.339821426371208, "State": "North Carolina"}, {"x": -4765.5481988754955, "y": -1553.5652764521035, "scale": 7.351244511236118, "State": "Virginia"}, {"x": -4584.568597969923, "y": -1417.4802934616946, "scale": 7.234632283037824, "State": "West Virginia"}, {"x": -5424.603472013296, "y": -1504.292435150911, "scale": 8, "State": "Maryland"}, {"x": -5617.324168631552, "y": -1454.1011739574328, "scale": 8, "State": "Delaware"}, {"x": -5331.199045351126, "y": -1263.7710730302301, "scale": 8, "State": "Pennsylvania"}, {"x": -4029.417912559621, "y": -1175.392044706865, "scale": 6.81685936194185, "State": "Ohio"}, {"x": -5659.329768988603, "y": -1291.9180315651297, "scale": 8, "State": "New Jersey"}, {"x": -3823.072405463585, "y": -586.1530771900749, "scale": 5.766493550715145, "State": "New York"}, {"x": -5816.492321993324, "y": -1060.6074450897668, "scale": 8, "State": "Connecticut"}, {"x": -5934.10807250855, "y": -1010.0439168544626, "scale": 8, "State": "Rhode Island"}, {"x": -5900.622099447889, "y": -922.8587523846645, "scale": 8, "State": "Massachusetts"}, {"x": -5731.103133016146, "y": -729.0831598631316, "scale": 8, "State": "Vermont"}, {"x": -5870.0835321451095, "y": -695.3106643251585, "scale": 8, "State": "New Hampshire"}, {"x": -4078.9999874928562, "y": -256.54376903875885, "scale": 5.588389737455319, "State": "Maine"}]
 

  constructor(private http: HttpClient) {

  }

  public post(limeID, task, treatment, interactionType, parameters, state, nl){

    var datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');

    console.log({ limeID: limeID, task: task, treatment: treatment, interaction: interactionType , parameters: JSON.stringify(parameters), state: JSON.stringify(state),  date: datetime, naturalLanguage: nl })
      this.http.post<any>('https://interactive-analytics.org:8443/interactions', { limeID: limeID, task: task, treatment: treatment, interaction: interactionType , parameters: JSON.stringify(parameters), state: JSON.stringify(state),  date: datetime, naturalLanguage: nl }).subscribe({
          next: data => {
              console.log(data);
          },
          error: error => {
              console.log( error.message);
              console.error('There was an error!', error);
          }
      })
      
  }

  public postSpeech(limeID, task, treatment, speech, text, state){
    var datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');

      this.http.post<any>('https://interactive-analytics.org:8443/speech', {limeID: limeID, task: task, treatment: treatment, text: text, speech: speech, state: state, date: datetime}).subscribe({
          next: data => {
              console.log(data);
          },
          error: error => {
              console.log( error.message);
              console.error('There was an error!', error);
          }
      })
  }

}
