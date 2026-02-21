pub mod tests;
use virt::connect::Connect;
fn main() {
    println!("Hello, world!");
    if let Ok(mut conn) = Connect::open(Some("test:///default")) {
        assert_eq!(Ok(0), conn.close());
    }
}

pub fn connect_to_virt() {
    println!("Hello, world!");
    if let Ok(mut conn) = Connect::open(Some("test:///default")) {
        assert_eq!(Ok(0), conn.close());
    }
}
#[cfg(test)]
pub mod testing {
    use crate::connect_to_virt;
    #[test]
    fn name() {
        connect_to_virt();
    }
}
