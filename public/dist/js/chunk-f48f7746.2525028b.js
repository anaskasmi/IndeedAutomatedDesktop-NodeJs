(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-f48f7746"],{"176c":function(t,e,n){"use strict";n("182d")},"182d":function(t,e,n){},"28c7":function(t,e,n){"use strict";n.r(e);var s=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("v-container",[n("div",{staticClass:"text-center mt-12 primary--text grow text-h4 text-uppercase"},[n("span",{staticClass:"carter"},[t._v(" Invoices Generator ")])]),n("div",{staticClass:"text-center mt-2 grey--text text--darken-2"},[n("span",{staticClass:"akaya"},[t._v(" Export Indeed invoices by jobs number ")])]),n("v-row",{staticClass:"col-12 mb-6",attrs:{justify:"center"}},[n("v-col",{attrs:{cols:"3"}},[n("v-divider")],1)],1),n("v-card",{attrs:{rounded:"lg",elevation:"0"}},[n("v-stepper",{attrs:{"non-linear":"",elevation:"0"},model:{value:t.currentStep,callback:function(e){t.currentStep=e},expression:"currentStep"}},[n("v-stepper-header",[n("v-stepper-step",{attrs:{editable:"",complete:!1,step:"1"}},[t._v(" Start Browser ")]),n("v-divider"),n("v-stepper-step",{attrs:{editable:"",complete:!1,step:"2"}},[t._v(" Generate Invoice ")])],1),n("v-stepper-items",{attrs:{elevation:"0"}},[n("v-stepper-content",{attrs:{step:"1",elevation:"0"}},[n("v-card",{attrs:{elevation:"0"}},[n("StartBrowserStepper")],1),n("hr"),n("v-btn",{staticClass:"float-right",attrs:{color:"primary",tile:"",large:""},on:{click:function(e){t.currentStep=2}}},[n("v-icon",[t._v("mdi-chevron-right ")]),t._v(" Set the dates and job number ")],1)],1),n("v-stepper-content",{staticClass:"text-center",attrs:{step:"2"}},[n("DatePicker"),n("v-divider",{staticClass:"my-3 mx-12"}),n("NumbersInput"),n("v-row",{staticClass:"col-12",attrs:{justify:"center"}},[n("v-btn",{staticClass:"my-12 px-12",attrs:{color:"success",tile:"","x-large":"",elevation:"3",loading:t.isLoading,disabled:t.isLoading},on:{click:t.generateInvoice}},[n("v-icon",{staticClass:"mr-2"},[t._v("mdi-file-download")]),t._v(" Generate Invoice ")],1)],1)],1)],1)],1)],1)],1)},i=[],a=n("1da1"),r=(n("96cf"),function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",[n("v-container",[n("v-alert",{attrs:{outlined:"",type:"info",prominent:"",border:"left"}},[t._v(" Please Click open the browser, then keep the browser opened during this whole process ")]),n("v-btn",{staticClass:"my-10",attrs:{large:"",tile:"",block:"",color:"success"},on:{click:function(e){return t.startTheBrowser()}}},[t._v(" Start the chromuim browser ")])],1)],1)}),o=[],l={name:"StartBrowserStepper_update",data:function(){return{}},methods:{BASE_URL:function(){return this.$store.state.BASE_URL},startTheBrowser:function(){var t=this.BASE_URL()+"/jobs/getNewBrowserForUpdate";this.$axios.get(t).then((function(){})).catch((function(t){console.log(t)}))}}},c=l,u=n("2877"),d=n("6544"),h=n.n(d),p=n("0798"),m=n("8336"),f=n("a523"),v=Object(u["a"])(c,r,o,!1,null,null,null),g=v.exports;h()(v,{VAlert:p["a"],VBtn:m["a"],VContainer:f["a"]});var b=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("v-card",{attrs:{elevation:"0"}},[n("v-card-title",[n("v-row",{staticClass:"col-12 info--text text--darken-1 font-weight-bold",attrs:{justify:"center"}},[t._v(" "+t._s(t.selectedDates.toString().replaceAll(","," > "))+" ")])],1),n("v-row",{attrs:{justify:"center"}},[n("v-date-picker",{staticClass:"col-8",attrs:{"full-width":"",range:""},model:{value:t.selectedDates,callback:function(e){t.selectedDates=e},expression:"selectedDates"}})],1)],1)},S=[],x={name:"",components:{},watch:{selectedDates:function(){this.selectedDates&&2==this.selectedDates.length&&this.reorderDates()}},data:function(){return{currentStep:1,dateRangeText:null}},computed:{selectedDates:{get:function(){return this.$store.getters["invoiceGeneratorModule/getSelectedDates"]},set:function(t){this.$store.commit("invoiceGeneratorModule/setsSelectedDates",t)}}},methods:{BASE_URL:function(){return this.$store.state.BASE_URL},reorderDates:function(){var t=this.$moment(this.selectedDates[0],"YYYY-MM-DD").format("YYYY-MM-DD"),e=this.$moment(this.selectedDates[1],"YYYY-MM-DD").format("YYYY-MM-DD");t>e&&(this.selectedDates[0]=e,this.selectedDates[1]=t)}}},w=x,D=n("b0af"),I=n("99d9"),C=n("2e4b"),V=n("0fd9"),_=Object(u["a"])(w,b,S,!1,null,null,null),y=_.exports;h()(_,{VCard:D["a"],VCardTitle:I["c"],VDatePicker:C["a"],VRow:V["a"]});var k=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("v-card",{attrs:{elevation:"0"}},[n("v-row",{staticClass:"col-12",attrs:{justify:"center"}},[n("div",{staticClass:"col-8"},[n("v-combobox",{attrs:{"hide-details":"",multiple:"",label:"Jobs numbers",chips:"","deletable-chips":"",filled:"",clearable:""},model:{value:t.jobsNumbers,callback:function(e){t.jobsNumbers=e},expression:"jobsNumbers"}})],1)])],1)},$=[],B={name:"",components:{},data:function(){return{currentStep:1,dates:[],dateRangeText:null}},computed:{jobsNumbers:{get:function(){return this.$store.getters["invoiceGeneratorModule/getJobsNumbers"]},set:function(t){this.$store.commit("invoiceGeneratorModule/setJobsNumbers",t)}}},methods:{BASE_URL:function(){return this.$store.state.BASE_URL}}},j=B,E=n("5530"),M=(n("d3b7"),n("25f0"),n("7db0"),n("8a79"),n("fb6a"),n("b0c0"),n("caad"),n("2532"),n("a434"),n("2bfd"),n("b974")),L=n("c6a6"),R=n("80d2"),Y=L["a"].extend({name:"v-combobox",props:{delimiters:{type:Array,default:function(){return[]}},returnObject:{type:Boolean,default:!0}},data:function(){return{editingIndex:-1}},computed:{computedCounterValue:function(){return this.multiple?this.selectedItems.length:(this.internalSearch||"").toString().length},hasSlot:function(){return M["a"].options.computed.hasSlot.call(this)||this.multiple},isAnyValueAllowed:function(){return!0},menuCanShow:function(){return!!this.isFocused&&(this.hasDisplayedItems||!!this.$slots["no-data"]&&!this.hideNoData)}},methods:{onInternalSearchChanged:function(t){if(t&&this.multiple&&this.delimiters.length){var e=this.delimiters.find((function(e){return t.endsWith(e)}));null!=e&&(this.internalSearch=t.slice(0,t.length-e.length),this.updateTags())}this.updateMenuDimensions()},genInput:function(){var t=L["a"].options.methods.genInput.call(this);return delete t.data.attrs.name,t.data.on.paste=this.onPaste,t},genChipSelection:function(t,e){var n=this,s=M["a"].options.methods.genChipSelection.call(this,t,e);return this.multiple&&(s.componentOptions.listeners=Object(E["a"])(Object(E["a"])({},s.componentOptions.listeners),{},{dblclick:function(){n.editingIndex=e,n.internalSearch=n.getText(t),n.selectedIndex=-1}})),s},onChipInput:function(t){M["a"].options.methods.onChipInput.call(this,t),this.editingIndex=-1},onEnterDown:function(t){t.preventDefault(),this.getMenuIndex()>-1||this.$nextTick(this.updateSelf)},onFilteredItemsChanged:function(t,e){this.autoSelectFirst&&L["a"].options.methods.onFilteredItemsChanged.call(this,t,e)},onKeyDown:function(t){var e=t.keyCode;M["a"].options.methods.onKeyDown.call(this,t),this.multiple&&e===R["s"].left&&0===this.$refs.input.selectionStart?this.updateSelf():e===R["s"].enter&&this.onEnterDown(t),this.changeSelectedIndex(e)},onTabDown:function(t){if(this.multiple&&this.internalSearch&&-1===this.getMenuIndex())return t.preventDefault(),t.stopPropagation(),this.updateTags();L["a"].options.methods.onTabDown.call(this,t)},selectItem:function(t){this.editingIndex>-1?this.updateEditing():(L["a"].options.methods.selectItem.call(this,t),this.internalSearch&&this.multiple&&this.getText(t).toLocaleLowerCase().includes(this.internalSearch.toLocaleLowerCase())&&(this.internalSearch=null))},setSelectedItems:function(){null==this.internalValue||""===this.internalValue?this.selectedItems=[]:this.selectedItems=this.multiple?this.internalValue:[this.internalValue]},setValue:function(t){var e;M["a"].options.methods.setValue.call(this,null!=(e=t)?e:this.internalSearch)},updateEditing:function(){var t=this.internalValue.slice();t[this.editingIndex]=this.internalSearch,this.setValue(t),this.editingIndex=-1},updateCombobox:function(){if(this.searchIsDirty){this.internalSearch!==this.getText(this.internalValue)&&this.setValue();var t=Boolean(this.$scopedSlots.selection)||this.hasChips;t&&(this.internalSearch=null)}},updateSelf:function(){this.multiple?this.updateTags():this.updateCombobox()},updateTags:function(){var t=this.getMenuIndex();if(!(t<0)||this.searchIsDirty){if(this.editingIndex>-1)return this.updateEditing();var e=this.selectedItems.indexOf(this.internalSearch);if(e>-1){var n=this.internalValue.slice();n.splice(e,1),this.setValue(n)}if(t>-1)return this.internalSearch=null;this.selectItem(this.internalSearch),this.internalSearch=null}},onPaste:function(t){var e;if(this.multiple&&!this.searchIsDirty){var n=null==(e=t.clipboardData)?void 0:e.getData("text/vnd.vuetify.autocomplete.item+plain");n&&-1===this.findExistingIndex(n)&&(t.preventDefault(),M["a"].options.methods.selectItem.call(this,n))}}}}),T=Object(u["a"])(j,k,$,!1,null,null,null),A=T.exports;h()(T,{VCard:D["a"],VCombobox:Y,VRow:V["a"]});var O={name:"UpdatingHomePage",components:{StartBrowserStepper:g,DatePicker:y,NumbersInput:A},data:function(){return{currentStep:1,isLoading:!1}},computed:{oneJobOrMoreSelected:{get:function(){return this.$store.getters["updatePageModule/getIsRepostingPageEnabled"]}},jobs:{get:function(){return this.$store.getters["updatePageModule/getJobs"]},set:function(t){this.$store.commit("updatePageModule/setJobs",t)}}},methods:{BASE_URL:function(){return this.$store.state.BASE_URL},generateInvoice:function(){var t=this;return Object(a["a"])(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return t.isLoading=!0,e.prev=1,e.next=4,t.$store.dispatch("invoiceGeneratorModule/generateInvoice");case 4:t.$swal({title:"Success",confirmButtonColor:"#3085d6",text:"Hi, We puted the invoice on your Desktop !",icon:"success"}),e.next=10;break;case 7:e.prev=7,e.t0=e["catch"](1),t.$swal({title:"Oops, Something went wrong ! ",text:e.t0,icon:"warning",confirmButtonColor:"#3085d6",cancelButtonColor:"#d33"});case 10:return e.prev=10,t.isLoading=!1,e.finish(10);case 13:case"end":return e.stop()}}),e,null,[[1,7,10,13]])})))()}}},P=O,U=(n("176c"),n("62ad")),N=n("ce7e"),G=n("132d"),J=n("7e85"),F=n("e516"),H=n("9c54"),K=n("56a4"),W=Object(u["a"])(P,s,i,!1,null,"6063bb33",null);e["default"]=W.exports;h()(W,{VBtn:m["a"],VCard:D["a"],VCol:U["a"],VContainer:f["a"],VDivider:N["a"],VIcon:G["a"],VRow:V["a"],VStepper:J["a"],VStepperContent:F["a"],VStepperHeader:H["a"],VStepperItems:H["b"],VStepperStep:K["a"]})}}]);
//# sourceMappingURL=chunk-f48f7746.2525028b.js.map