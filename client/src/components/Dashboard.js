import React from 'react'
import { Col, Container, Row } from 'reactstrap'
import ChatList from './ChatList'
import ChatArea from './ChatArea'

export default function Dashboard() {
    return (
        <Container fluid>
            <Row>
                <Col sm={4} className='p-0'>
                    <ChatList />
                </Col>
                <Col sm={8} className='p-0'>
                    <ChatArea />
                </Col>
            </Row>
        </Container>
    )
}
