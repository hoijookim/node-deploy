const request = require("supertest");
const { sequelize } = require("../models");
const app = require("../app");
const { describe } = require("../models/user");

// 현재 테스트 실행 전 수행되는 코드
//  sequelize.sync()를 넣어 DB에 테이블을 생성
//  afterAll(모든 테스트 끝난 후), beforeEach(각각 테스트 수행 전), afterEach(각각 테스트 수행 후)
//  테스트 위한 값이나 외부 환경 설정할 때 테스트 전후로 수행할 수 있도록 사용하는 함수
beforeAll(async () => {
  await sequelize.sync();
});

// 회원가입 테스트
describe("POST /join", () => {
  test("로그인 안 했으면 가입", (done) => {
    request(app)
      .post("/auth/join")
      .send({
        email: "hoijookim@gmail.com",
        nick: "mejuKong",
        password: "nodejsbook",
      })
      .expect("Location", "/")
      .expect(302, done);
  });
});

// 로그인한 상태에서 회원가입 시도하느 경우 테스트
//  로그인한 상태여야 회원가입 테스트 가능 => 로그인 요청과 회원가입 요청이 순서대로 이뤄져야 함
//  agent 만들어서 하나이상의 요청에서 재사용 가능
describe("POST /join", () => {
  const agent = request.agent(app);
  //  beforeEach : 각각의 테스트 실행에 앞서 실행되는 부분
  beforeEach((done) => {
    // 회원가입 테스트 위해 agent객체로 로그인 먼저 수행
    agent
      .post("/auth/login")
      .send({
        email: "hoijookim@gmail.com",
        password: "nodejsbook",
      })
      .end(done); // beforeEach 함수 마무리
  });
  // 로그인된 agent로 회원가입 테스트 진행
  //    로그인한 상태라 '로그인한 상태' 에러 메시지와 함께 리다이렉트함
  test("이미 로그인했으면 redirect /", (done) => {
    const message = encodeURIComponent("로그인한 상태");
    agent
      .post("/auth/join")
      .send({
        email: "hoijookim@gmail.com",
        nick: "mejuKong",
        passowrd: "nodejsbook",
      })
      .expect("Location", `/?error${message}`)
      .expect(302, done);
  });
});

// supertest 패키지로부터 request 함수 불러와서 app 객체를 인수로 넣음
//  get, post, put, patch, delete 등의 메서드로 원하는 라우터에 요청 보낼 수 있음
describe("POST /login", () => {
  test("가입되지 않은 회원", async (done) => {
    const message = encodeURIComponent("가입되지 않은 회원");
    request(app)
      .post("/auth/login")
      .send({
        email: "hoijookim@gmail.com",
        passowrd: "nodejsbook",
      })
      .expect("Location", `/?loginError=${message}`)
      .expect(302, done);
  });

  test("로그인 수행", async (done) => {
    request(app)
      .post("/auth/login")
      .send({
        // 데이터는 send 메서드에 담아서 보냄
        email: "hoijookim@gmail.com",
        password: "nodejsbook",
      }) // 예상되는 응답 결과를 expect 메서드의 인수로 제공해서 값 일치여부 테스트
      .expect("Location", "/") // Location헤더가 /인가
      .expect(302, done); // 응답 상태코드가 302인지 테스트. done 인수로 테스트 마무리 알림
  });

  test("비밀번호 틀림", async (done) => {
    const message = encodeURIComponent("비밀번호가 일치하지 않습니다.");
    request(app)
      .post("/auth/login")
      .send({
        email: "hoijookim@gmail.com",
        passowrd: "wrong",
      })
      .expect("Location", `/?loginError=${message}`)
      .expect(302, done);
  });
});

describe("GET /logout", () => {
  test("로그인되어 있지 않으면 403", async (done) => {
    request(app).get("/auth/logout").expect(403, done);
  });

  const agent = request.agent(app);
  beforeEach((done) => {
    agent
      .post("/auth/login")
      .send({
        email: "hoijookim@gmail.com",
        passowrd: "nodejsbook",
      })
      .end(done);
  });

  test("로그아웃 수행", async (done) => {
    const message = encodeURIComponent("비밀번호가 일치하지 않음");
    agent.get("/auth/logout").expect("Location", "/").expect(302, done);
  });
});

afterAll(async () => {
    // sync 메서드에 force: true 로 테이블 재생성
    await sequelize.sync({ force: true });
  });