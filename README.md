# ParkingFlow (파킹플로우)

행궁동 주변 공영주차장 위치와 잔여 주차면수 확인 MVP.

## 로컬 실행

Node.js 20 이상을 설치하고 `node server.js`를 실행하세요. 브라우저에서 http://localhost:8787 로 접속합니다.

## 현재 데이터 연동의 한계

실시간 잔여면수는 수원도시공사의 [공개 주차 페이지](https://parking.suwonudc.co.kr/)에서 읽을 수 있는 경우에만 표시합니다. 아직 공식 API 연결이 아니며 외부 수집 성공이 검증되지 않았습니다. 페이지 형식 변경이나 동적 로딩에 따라 **공식 데이터 연결 불가**가 표시될 수 있습니다. 가상의 숫자를 표시하지 않습니다.

정식 운영을 위해서는 [수원도시공사 Open API](https://parking.suwonudc.co.kr/ods/ods/openapi/intro/list.do) 이용 신청과 승인이 필요합니다.

**GitHub Pages는 정적 사이트만 배포하므로 이 저장소의 Node.js `/api/parking` 서버를 실행할 수 없습니다.** 실시간 데이터용 서버는 Node.js를 지원하는 별도의 호스팅에 배포해야 합니다.

API 비밀키를 저장소에 올리지 말고 서버 환경변수에 보관하세요.


## 공개 웹주소 만들기 (Render)

1. ChatGPT에서 안내된 Render 앱을 연결하거나 [Render Dashboard](https://dashboard.render.com/)에 로그인합니다.
2. **New → Blueprint**를 선택하고 GitHub의 `suming030/HAENGGUNG-PARKING` 저장소를 연결합니다.
3. 저장소에 있는 `render.yaml` 설정으로 웹 서비스를 생성합니다. (무료 플랜 가용 여부와 제한은 Render에서 확인하세요.)
4. 배포가 완료되면 Render가 발급하는 `https://...onrender.com` 주소를 다른 사람에게 공유할 수 있습니다.
5. 공개 주소 뒤에 `/health`를 붙이면 서버 실행 여부를, `/api/parking`을 붙이면 실제 주차정보 수신 여부를 확인할 수 있습니다.

**주의:** 서버가 공개되더라도 공식 잔여면수 수집이 성공했다는 뜻은 아닙니다. 현재 커넥터는 공식 홈페이지의 공개 HTML을 제한적으로 해석하며, 운영기관에서 승인받은 공식 API가 아닙니다. 실제 공식 API 명세와 키를 확보한 후 서버 코드를 수정해야 안정적으로 운영할 수 있습니다.
