(()=>{var e={};e.id=6282,e.ids=[6282],e.modules={55403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},94749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},25528:e=>{"use strict";e.exports=require("next/dist\\client\\components\\action-async-storage.external.js")},91877:e=>{"use strict";e.exports=require("next/dist\\client\\components\\request-async-storage.external.js")},25319:e=>{"use strict";e.exports=require("next/dist\\client\\components\\static-generation-async-storage.external.js")},57310:e=>{"use strict";e.exports=require("url")},52917:(e,a,s)=>{"use strict";s.r(a),s.d(a,{GlobalError:()=>i.a,__next_app__:()=>h,originalPathname:()=>m,pages:()=>d,routeModule:()=>p,tree:()=>c});var l=s(67096),t=s(16132),r=s(37284),i=s.n(r),o=s(32564),n={};for(let e in o)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(n[e]=()=>o[e]);s.d(a,n);let c=["",{children:["school-admin",{children:["profile",{children:["edit",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(s.bind(s,94692)),"C:\\xampp\\htdocs\\childclub\\childclub-frontend\\src\\app\\school-admin\\profile\\edit\\page.tsx"]}]},{}]},{}]},{layout:[()=>Promise.resolve().then(s.bind(s,25803)),"C:\\xampp\\htdocs\\childclub\\childclub-frontend\\src\\app\\school-admin\\layout.tsx"]}]},{layout:[()=>Promise.resolve().then(s.bind(s,79113)),"C:\\xampp\\htdocs\\childclub\\childclub-frontend\\src\\app\\layout.tsx"],"not-found":[()=>Promise.resolve().then(s.t.bind(s,9291,23)),"next/dist/client/components/not-found-error"]}],d=["C:\\xampp\\htdocs\\childclub\\childclub-frontend\\src\\app\\school-admin\\profile\\edit\\page.tsx"],m="/school-admin/profile/edit/page",h={require:s,loadChunk:()=>Promise.resolve()},p=new l.AppPageRouteModule({definition:{kind:t.x.APP_PAGE,page:"/school-admin/profile/edit/page",pathname:"/school-admin/profile/edit",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:c}})},22e3:(e,a,s)=>{Promise.resolve().then(s.bind(s,6030))},6030:(e,a,s)=>{"use strict";s.r(a),s.d(a,{default:()=>EditProfilePage});var l=s(30784),t=s(9885),r=s(59494),i=s(976),o=s(87094),n=s(517),c=s(93804),d=s(93680),m=s(59490),h=s(14571),p=s(86078),u=s(39546),x=s(91672),f=s(52995);s(99973);var b=s(11440),j=s.n(b),v=s(85525),g=s(19300);let N=`
  .profile-card {
    transition: all 0.3s ease;
    border: none;
    border-radius: 1rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  }
  
  .profile-card:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  }
  
  .profile-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 1rem 1rem 0 0;
    padding: 3rem 2rem;
    text-align: center;
    position: relative;
  }
  
  .profile-avatar {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    border: 5px solid white;
    margin: 0 auto 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .profile-avatar:hover {
    transform: scale(1.05);
  }
  
  .profile-avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .profile-avatar:hover .profile-avatar-overlay {
    opacity: 1;
  }
  
  .form-section {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    margin-bottom: 1.5rem;
    border: 1px solid #e9ecef;
  }
  
  .form-section-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e9ecef;
  }
  
  .form-section-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .save-btn {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    box-shadow: 0 0.5rem 1rem rgba(13, 110, 253, 0.3);
    transition: all 0.3s ease;
    z-index: 1000;
  }
  
  .save-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 0.75rem 1.5rem rgba(13, 110, 253, 0.4);
  }
  
  .info-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0.25rem;
  }
`;function EditProfilePage(){let[e,a]=(0,t.useState)(!0),[s,b]=(0,t.useState)(!1),[y,w]=(0,t.useState)(null),[S,C]=(0,t.useState)(null),[P,_]=(0,t.useState)(""),[E,z]=(0,t.useState)(""),[A,T]=(0,t.useState)(""),[Z,k]=(0,t.useState)(""),[q,$]=(0,t.useState)(""),[B,Y]=(0,t.useState)(""),[I,U]=(0,t.useState)(""),[F,D]=(0,t.useState)(""),[M,G]=(0,t.useState)(""),[L,O]=(0,t.useState)("India"),[J,K]=(0,t.useState)(""),[R,V]=(0,t.useState)(""),[H,W]=(0,t.useState)(""),[X,Q]=(0,t.useState)(""),[ee,ea]=(0,t.useState)(""),[es,el]=(0,t.useState)(""),[et,er]=(0,t.useState)(""),[ei,eo]=(0,t.useState)("");(0,t.useEffect)(()=>{fetchProfileData()},[]);let fetchProfileData=async()=>{try{a(!0);let e=(0,v.hV)(),s=(0,v.vF)();if(!e){await g.Z.fire({icon:"error",title:"Authentication Required",text:"Please login to continue",confirmButtonColor:"#dc3545"}),window.location.href="/school-admin/login";return}w(s);let l=await fetch(`${v.CT}/auth/profile`,{headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"}});if(l.ok){let e=await l.json();_(e.firstName||""),z(e.lastName||""),T(e.email||""),k(e.mobile||"")}let t=await fetch(`${v.CT}/schools/me`,{headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"}});if(t.ok){let e=await t.json();C(e),$(e.name||""),Y(e.address||""),U(e.city||""),D(e.state||""),G(e.postalCode||""),O(e.country||"India"),K(e.establishedYear||""),V(e.type||""),W(e.website||""),Q(e.description||""),ea(e.email||""),el(e.phone||""),er(e.totalStudents||""),eo(e.totalTeachers||"")}}catch(e){console.error("Error fetching profile data:",e),await g.Z.fire({icon:"error",title:"Error",text:"Failed to load profile data",confirmButtonColor:"#dc3545"})}finally{a(!1)}},handleSaveProfile=async()=>{b(!0);try{let e=(0,v.hV)();if(!e)throw Error("Authentication required");let a=await fetch(`${v.CT}/auth/profile`,{method:"PUT",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify({firstName:P,lastName:E,mobile:Z})});if(!a.ok){let e=await a.json();throw Error(e.message||"Failed to update personal information")}if(S&&S.id){let a=await fetch(`${v.CT}/schools/${S.id}`,{method:"PUT",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify({name:q,address:B,city:I,state:F,postalCode:M,country:L,establishedYear:parseInt(J)||null,type:R,website:H,description:X,email:ee,phone:es,totalStudents:parseInt(et)||null,totalTeachers:parseInt(ei)||null})});if(!a.ok){let e=await a.json();throw Error(e.message||"Failed to update school information")}}await g.Z.fire({icon:"success",title:"Profile Updated!",text:"Your profile has been updated successfully.",confirmButtonColor:"#0d6efd",confirmButtonText:"Great!"}),fetchProfileData()}catch(e){console.error("Error saving profile:",e),await g.Z.fire({icon:"error",title:"Error",text:e?.message||"Failed to update profile. Please try again.",confirmButtonColor:"#dc3545"})}finally{b(!1)}};return e?l.jsx("div",{className:"min-vh-100 d-flex align-items-center justify-content-center",children:(0,l.jsxs)("div",{className:"text-center",children:[l.jsx("div",{className:"spinner-border text-primary",role:"status",children:l.jsx("span",{className:"visually-hidden",children:"Loading..."})}),l.jsx("p",{className:"mt-3 text-muted",children:"Loading profile data..."})]})}):(0,l.jsxs)(l.Fragment,{children:[l.jsx("style",{children:N}),(0,l.jsxs)("div",{className:"min-vh-100 bg-light",children:[l.jsx("div",{className:"bg-white shadow-sm border-bottom",children:l.jsx("div",{className:"container-fluid py-4",children:(0,l.jsxs)("div",{className:"d-flex align-items-center justify-content-between",children:[(0,l.jsxs)("div",{children:[(0,l.jsxs)("h3",{className:"fw-bold text-dark mb-1",children:[l.jsx(r.Z,{className:"me-2 text-primary",size:28,style:{display:"inline"}}),"Edit Profile"]}),l.jsx("p",{className:"text-muted mb-0",children:"Update your school and personal information"})]}),(0,l.jsxs)(j(),{href:"/school-admin/dashboard",className:"btn btn-outline-primary",children:[l.jsx("i",{className:"fas fa-arrow-left me-2"}),"Back to Dashboard"]})]})})}),l.jsx("div",{className:"container-fluid py-5",children:l.jsx("div",{className:"row",children:(0,l.jsxs)("div",{className:"col-lg-10 mx-auto",children:[l.jsx("div",{className:"profile-card mb-4",children:(0,l.jsxs)("div",{className:"profile-header",children:[(0,l.jsxs)("div",{className:"profile-avatar",children:[l.jsx("div",{className:"text-primary",style:{fontSize:"4rem"},children:q?q.charAt(0).toUpperCase():"S"}),l.jsx("div",{className:"profile-avatar-overlay",children:l.jsx(i.Z,{size:30,className:"text-white"})})]}),l.jsx("h3",{className:"fw-bold mb-2",children:q||"School Name"}),(0,l.jsxs)("p",{className:"mb-3",children:[l.jsx(o.Z,{size:18,className:"me-2",style:{display:"inline"}}),I&&F?`${I}, ${F}`:"Location not set"]}),(0,l.jsxs)("div",{className:"d-flex flex-wrap justify-content-center gap-2",children:[(0,l.jsxs)("span",{className:"info-badge",children:[l.jsx(n.Z,{size:16}),"Est. ",J||"N/A"]}),(0,l.jsxs)("span",{className:"info-badge",children:[l.jsx(c.Z,{size:16}),R?R.replace("_"," ").replace(/\b\w/g,e=>e.toUpperCase()):"N/A"]})]})]})}),(0,l.jsxs)("div",{className:"form-section",children:[(0,l.jsxs)("div",{className:"form-section-header",children:[l.jsx("div",{className:"form-section-icon bg-primary bg-opacity-10 text-primary",children:l.jsx(d.Z,{size:24})}),(0,l.jsxs)("div",{children:[l.jsx("h5",{className:"fw-bold mb-0",children:"Personal Information"}),l.jsx("p",{className:"text-muted mb-0 small",children:"Your personal details"})]})]}),(0,l.jsxs)("div",{className:"row g-3",children:[(0,l.jsxs)("div",{className:"col-md-6",children:[l.jsx("label",{className:"form-label fw-semibold",children:"First Name"}),l.jsx("input",{type:"text",className:"form-control",value:P,onChange:e=>_(e.target.value),placeholder:"Enter first name"})]}),(0,l.jsxs)("div",{className:"col-md-6",children:[l.jsx("label",{className:"form-label fw-semibold",children:"Last Name"}),l.jsx("input",{type:"text",className:"form-control",value:E,onChange:e=>z(e.target.value),placeholder:"Enter last name"})]}),(0,l.jsxs)("div",{className:"col-md-6",children:[(0,l.jsxs)("label",{className:"form-label fw-semibold",children:[l.jsx(m.Z,{size:16,className:"me-2"}),"Email Address"]}),l.jsx("input",{type:"email",className:"form-control",value:A,onChange:e=>T(e.target.value),placeholder:"Enter email",disabled:!0}),l.jsx("small",{className:"text-muted",children:"Email cannot be changed"})]}),(0,l.jsxs)("div",{className:"col-md-6",children:[(0,l.jsxs)("label",{className:"form-label fw-semibold",children:[l.jsx(h.Z,{size:16,className:"me-2"}),"Mobile Number"]}),l.jsx("input",{type:"tel",className:"form-control",value:Z,onChange:e=>k(e.target.value),placeholder:"Enter mobile number"})]})]})]}),(0,l.jsxs)("div",{className:"form-section",children:[(0,l.jsxs)("div",{className:"form-section-header",children:[l.jsx("div",{className:"form-section-icon bg-success bg-opacity-10 text-success",children:l.jsx(c.Z,{size:24})}),(0,l.jsxs)("div",{children:[l.jsx("h5",{className:"fw-bold mb-0",children:"School Information"}),l.jsx("p",{className:"text-muted mb-0 small",children:"Basic school details"})]})]}),(0,l.jsxs)("div",{className:"row g-3",children:[(0,l.jsxs)("div",{className:"col-12",children:[l.jsx("label",{className:"form-label fw-semibold",children:"School Name"}),l.jsx("input",{type:"text",className:"form-control",value:q,onChange:e=>$(e.target.value),placeholder:"Enter school name"})]}),(0,l.jsxs)("div",{className:"col-12",children:[l.jsx("label",{className:"form-label fw-semibold",children:"School Address"}),l.jsx("textarea",{className:"form-control",rows:2,value:B,onChange:e=>Y(e.target.value),placeholder:"Enter complete address"})]}),(0,l.jsxs)("div",{className:"col-md-6",children:[l.jsx("label",{className:"form-label fw-semibold",children:"City"}),l.jsx("input",{type:"text",className:"form-control",value:I,onChange:e=>U(e.target.value),placeholder:"Enter city"})]}),(0,l.jsxs)("div",{className:"col-md-6",children:[l.jsx("label",{className:"form-label fw-semibold",children:"State"}),l.jsx("input",{type:"text",className:"form-control",value:F,onChange:e=>D(e.target.value),placeholder:"Enter state"})]}),(0,l.jsxs)("div",{className:"col-md-6",children:[l.jsx("label",{className:"form-label fw-semibold",children:"Postal Code"}),l.jsx("input",{type:"text",className:"form-control",value:M,onChange:e=>G(e.target.value),placeholder:"Enter postal code"})]}),(0,l.jsxs)("div",{className:"col-md-6",children:[l.jsx("label",{className:"form-label fw-semibold",children:"Country"}),(0,l.jsxs)("select",{className:"form-select",value:L,onChange:e=>O(e.target.value),children:[l.jsx("option",{value:"India",children:"India"}),l.jsx("option",{value:"USA",children:"USA"}),l.jsx("option",{value:"UK",children:"UK"}),l.jsx("option",{value:"Canada",children:"Canada"}),l.jsx("option",{value:"Australia",children:"Australia"})]})]}),(0,l.jsxs)("div",{className:"col-md-6",children:[l.jsx("label",{className:"form-label fw-semibold",children:"Established Year"}),l.jsx("input",{type:"number",className:"form-control",value:J,onChange:e=>K(e.target.value),placeholder:"YYYY",min:"1800",max:new Date().getFullYear()})]}),(0,l.jsxs)("div",{className:"col-md-6",children:[l.jsx("label",{className:"form-label fw-semibold",children:"School Type"}),(0,l.jsxs)("select",{className:"form-select",value:R,onChange:e=>V(e.target.value),children:[l.jsx("option",{value:"",children:"Select Type"}),l.jsx("option",{value:"primary",children:"Primary School"}),l.jsx("option",{value:"secondary",children:"Secondary School"}),l.jsx("option",{value:"higher_secondary",children:"Higher Secondary"}),l.jsx("option",{value:"international",children:"International"}),l.jsx("option",{value:"special_needs",children:"Special Needs"})]})]}),(0,l.jsxs)("div",{className:"col-md-6",children:[(0,l.jsxs)("label",{className:"form-label fw-semibold",children:[l.jsx(p.Z,{size:16,className:"me-2"}),"Website"]}),l.jsx("input",{type:"url",className:"form-control",value:H,onChange:e=>W(e.target.value),placeholder:"https://www.example.com"})]}),(0,l.jsxs)("div",{className:"col-md-6",children:[(0,l.jsxs)("label",{className:"form-label fw-semibold",children:[l.jsx(m.Z,{size:16,className:"me-2"}),"School Email"]}),l.jsx("input",{type:"email",className:"form-control",value:ee,onChange:e=>ea(e.target.value),placeholder:"school@example.com"})]}),(0,l.jsxs)("div",{className:"col-12",children:[(0,l.jsxs)("label",{className:"form-label fw-semibold",children:[l.jsx(u.Z,{size:16,className:"me-2"}),"School Description"]}),l.jsx("textarea",{className:"form-control",rows:4,value:X,onChange:e=>Q(e.target.value),placeholder:"Brief description about your school..."})]})]})]}),(0,l.jsxs)("div",{className:"form-section",children:[(0,l.jsxs)("div",{className:"form-section-header",children:[l.jsx("div",{className:"form-section-icon bg-info bg-opacity-10 text-info",children:l.jsx(x.Z,{size:24})}),(0,l.jsxs)("div",{children:[l.jsx("h5",{className:"fw-bold mb-0",children:"Additional Details"}),l.jsx("p",{className:"text-muted mb-0 small",children:"Contact and administrative information"})]})]}),(0,l.jsxs)("div",{className:"row g-3",children:[(0,l.jsxs)("div",{className:"col-md-4",children:[(0,l.jsxs)("label",{className:"form-label fw-semibold",children:[l.jsx(h.Z,{size:16,className:"me-2"}),"School Phone"]}),l.jsx("input",{type:"tel",className:"form-control",value:es,onChange:e=>el(e.target.value),placeholder:"School contact number"})]}),(0,l.jsxs)("div",{className:"col-md-4",children:[l.jsx("label",{className:"form-label fw-semibold",children:"Total Students (Capacity)"}),l.jsx("input",{type:"number",className:"form-control",value:et,onChange:e=>er(e.target.value),placeholder:"Maximum student capacity"})]}),(0,l.jsxs)("div",{className:"col-md-4",children:[l.jsx("label",{className:"form-label fw-semibold",children:"Total Teachers (Staff)"}),l.jsx("input",{type:"number",className:"form-control",value:ei,onChange:e=>eo(e.target.value),placeholder:"Total teaching staff"})]})]})]})]})})}),(0,l.jsxs)("button",{className:"btn btn-primary btn-lg save-btn",onClick:handleSaveProfile,disabled:s,children:[l.jsx(f.Z,{size:20,className:"me-2"}),s?"Saving...":"Save Profile"]})]})]})}},94692:(e,a,s)=>{"use strict";s.r(a),s.d(a,{$$typeof:()=>i,__esModule:()=>r,default:()=>n});var l=s(95153);let t=(0,l.createProxy)(String.raw`C:\xampp\htdocs\childclub\childclub-frontend\src\app\school-admin\profile\edit\page.tsx`),{__esModule:r,$$typeof:i}=t,o=t.default,n=o}};var a=require("../../../../webpack-runtime.js");a.C(e);var __webpack_exec__=e=>a(a.s=e),s=a.X(0,[659,1336,9675,3528,4301,4154,9300,806,1411,656,5525,7565],()=>__webpack_exec__(52917));module.exports=s})();