import React from 'react';
import { Typography, Layout, Row, Col, Card, Button, Avatar } from 'antd';
import { RocketOutlined, BookOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { Content } = Layout;

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <RocketOutlined style={{ fontSize: '48px', color: '#1890ff' }} />,
      title: 'Học Nhanh & Hiệu Quả',
      description: 'Tiếp cận kiến thức một cách nhanh chóng với các khóa học được thiết kế chuyên nghiệp và dễ hiểu',
    },
    {
      icon: <BookOutlined style={{ fontSize: '48px', color: '#52c41a' }} />,
      title: 'Tài Liệu Toàn Diện',
      description: 'Kho tài liệu, bài giảng và bài tập phong phú, hỗ trợ bạn học tập mọi lúc mọi nơi',
    },
    {
      icon: <TeamOutlined style={{ fontSize: '48px', color: '#722ed1' }} />,
      title: 'Thảo Luận & Trao Đổi',
      description: 'Tham gia các cuộc thảo luận để trao đổi kiến thức, hỏi đáp và học cùng cộng đồng',
    },
  ];

  const developers = [
    { name: 'Nguyễn Trung Đức', avatar: '', studentId: '20225288' },
    { name: 'Nguyễn Nho Dũng', avatar: '', studentId: '20210221' },
    { name: 'Nguyễn Hữu Dũng', avatar: '', studentId: '20235052' },
    { name: 'Phan Đức Dũng', avatar: '', studentId: '20225294' },
  ];

  const handleGetStarted = () => {
    navigate('/login'); // tạm thời, chưa có login
  };

  const handleSignUp = () => {
    navigate('/register'); //tạm thời, chưa có register
  };

  return (
    <Content style={{ padding: '0', minHeight: '100vh' }}>
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
          padding: '60px 20px',
          marginBottom: '50px',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Title level={1} style={{ color: 'white', fontSize: '2rem', marginBottom: '20px' }}>
          Chào Mừng Đến Với Website Học Tập Trực Tuyến
        </Title>
        <Paragraph style={{ fontSize: '1rem', color: 'white', marginBottom: '30px' }}>
          Hành trình thành công của bạn bắt đầu từ đây. Hãy tham gia cùng hàng nghìn người học đã thay đổi sự nghiệp của họ với chúng tôi.
        </Paragraph>
        <Button
          type="primary"
          size="large"
          style={{ height: '45px', padding: '0 30px', fontSize: '16px', borderRadius: '8px' }}
          onClick={handleGetStarted}
        >
          Bắt Đầu Ngay
        </Button>
      </div>

      {/* Features Section */}
      <Row gutter={[16, 16]} justify="center" style={{ marginBottom: '50px', padding: '0 10px' }}>
        {features.map((feature, index) => (
          <Col xs={24} sm={12} md={8} key={index}>
            <Card
              hoverable
              style={{
                textAlign: 'center',
                height: '100%',
                borderRadius: '15px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: '20px',
              }}
            >
              <div style={{ marginBottom: '15px' }}>{feature.icon}</div>
              <Title level={3} style={{ marginBottom: '10px', fontSize: '1.2rem' }}>
                {feature.title}
              </Title>
              <Paragraph style={{ fontSize: '0.95rem', color: '#666' }}>{feature.description}</Paragraph>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Developers Section */}
      <div style={{ marginBottom: '50px', padding: '0 10px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '40px', fontSize: '1.6rem' }}>
          Thành Viên Nhóm Phát Triển
        </Title>
        <Row gutter={[16, 16]} justify="center">
          {developers.map((dev, index) => (
            <Col xs={12} sm={8} md={6} key={index}>
              <Card
                hoverable
                style={{
                  borderRadius: '15px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                  padding: '15px',
                }}
              >
                <Avatar size={80} src={dev.avatar} style={{ marginBottom: '10px' }} />
                <Title level={4} style={{ margin: 0, fontSize: '1rem' }}>
                  {dev.name}
                </Title>
                <Title level={4} style={{ margin: 0, fontSize: '1rem', color: '#1622d4ff' }}>
                  {dev.studentId}
                </Title>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Call to Action Section */}
      <Row justify="center" style={{ marginBottom: '50px', padding: '0 10px' }}>
        <Col xs={24} md={16}>
          <Card style={{ background: '#f5f5f5', borderRadius: '15px', padding: '30px', textAlign: 'center' }}>
            <Title level={2} style={{ marginBottom: '20px', fontSize: '1.6rem' }}>
              Sẵn Sàng Bắt Đầu Hành Trình?
            </Title>
            <Paragraph style={{ fontSize: '1rem', marginBottom: '20px' }}>
              Hãy tham gia các khóa học của chúng tôi ngay hôm nay và thực hiện bước đầu tiên hướng tới mục tiêu của bạn.
            </Paragraph>
            <Button type="primary" size="large" onClick={handleSignUp} style={{ height: '45px', padding: '0 30px' }}>
              Đăng Ký Ngay
            </Button>
          </Card>
        </Col>
      </Row>
    </Content>
  );
};

export default Home;
