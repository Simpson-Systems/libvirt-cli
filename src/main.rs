pub mod tests;
use virt::connect::Connect;
fn main() {
    println!("Hello, world!");
    if let Ok(mut conn) = Connect::open(Some("test:///default")) {
        assert_eq!(Ok(0), conn.close());
    }
}
