import React from 'react';

// import { Container } from './styles';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = (props) => {
  const { title } = props;

  return <div>{title}</div>;
}

export default Header;